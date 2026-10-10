import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

export const unexpectedStatusRate = new Rate("unexpected_statuses");
export const questionnaireLatency = new Trend("questionnaire_submission_duration");
export const successfulSubmissions = new Counter("successful_questionnaire_submissions");
export const irisTtft = new Trend("iris_time_to_first_token");

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const IS_WITNESS = __ENV.IS_WITNESS === "true";

let draftsMap = {};
if (!IS_WITNESS) {
  try {
    draftsMap = JSON.parse(open("./raw/drafts.json"));
  } catch (e) {}
}

export const options = {
  scenarios: {
    load_test: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "10s", target: 10 },
        { duration: "20s", target: 50 },
        { duration: "30s", target: 100 },
        { duration: "10s", target: 0 },
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: {
    unexpected_statuses: [{ threshold: "rate<0.01", abortOnFail: true, delayAbortEval: "30s" }],
    questionnaire_submission_duration: ["p(95)<1500"],
  },
};

export function setup() {
  const sessions = [];
  const userCount = 20;

  for (let i = 1; i <= userCount; i++) {
    const email = `b2b.user.${i}@linkoffice-loadtest.fr`;
    const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
    let csrfToken = "";
    try {
      csrfToken = csrfRes.json().csrfToken;
    } catch (e) {}

    const csrfCookie = csrfRes.headers["Set-Cookie"] || "";

    const loginRes = http.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      {
        email: IS_WITNESS ? "invalid-user@nowhere.com" : email,
        password: IS_WITNESS ? "WrongPass!" : "Admin1234!",
        csrfToken: csrfToken,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: csrfCookie,
        },
        redirects: 0,
      }
    );

    const loginCookie = loginRes.headers["Set-Cookie"] || "";
    const sessionCookie = `${csrfCookie}; ${loginCookie}`;
    const finalCookie = IS_WITNESS ? "authjs.session-token=corrupted_invalid_token" : sessionCookie;

    let userId = "";
    let convId = "";

    if (!IS_WITNESS) {
      const sessRes = http.get(`${BASE_URL}/api/auth/session`, {
        headers: { Cookie: finalCookie },
      });
      if (sessRes.status === 200) {
        try {
          userId = sessRes.json().user.id;
        } catch (e) {}
      }

      const convRes = http.post(
        `${BASE_URL}/api/iris/conversation`,
        JSON.stringify({}),
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: finalCookie,
          },
        }
      );
      if (convRes.status === 200) {
        try {
          convId = convRes.json().conversation_id;
        } catch (e) {}
      }
    }

    sessions.push({
      email,
      userId,
      cookie: finalCookie,
      conversationId: convId,
    });
  }

  return { sessions };
}

export default function (data) {
  const session = data.sessions[(__VU - 1) % data.sessions.length];
  const cookie = session.cookie;
  const userId = session.userId;
  const convId = session.conversationId;

  // 1. Scénario : Soumission de questionnaire
  if (IS_WITNESS) {
    // Dans le test témoin, le cookie corrompu doit échouer
    const failRes = http.post(
      `${BASE_URL}/api/questionnaire/submit`,
      JSON.stringify({ assessmentId: "invalid-id" }),
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
      }
    );
    const pass = check(failRes, { "must be 200 (fails)": (r) => r.status === 200 });
    if (!pass) unexpectedStatusRate.add(1);
    sleep(1);
    return;
  }

  const userDrafts = draftsMap[userId] || [];
  if (userDrafts.length > 0) {
    const assessmentId = userDrafts[__ITER % userDrafts.length];
    const t0 = new Date().getTime();
    const submitRes = http.post(
      `${BASE_URL}/api/questionnaire/submit`,
      JSON.stringify({ assessmentId }),
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        tags: { name: "SubmitQuestionnaire" },
      }
    );
    const duration = new Date().getTime() - t0;
    questionnaireLatency.add(duration);

    const submitOk = check(submitRes, {
      "submit status is 200": (r) => r.status === 200,
    });

    if (submitOk) {
      successfulSubmissions.add(1);
      unexpectedStatusRate.add(0);
    } else {
      unexpectedStatusRate.add(1);
    }
  }

  // 2. Scénario : Lecture autorisée (200 exigé seul, un 403 n'est pas un succès de lecture)
  const readRes = http.get(`${BASE_URL}/api/questions`, {
    headers: { Cookie: cookie },
    tags: { name: "ReadAuthorized" },
  });
  const readOk = check(readRes, {
    "read status is 200": (r) => r.status === 200,
    "not timed out": (r) => r.status !== 0 && r.timings.duration < 60000,
  });
  if (!readOk) unexpectedStatusRate.add(1);

  // 3. Scénario : Dialogue IRIS
  if (convId && __ITER % 3 === 0) {
    const tIris0 = new Date().getTime();
    const irisRes = http.post(
      `${BASE_URL}/api/iris/conversation/${convId}/message`,
      JSON.stringify({
        message_user: "Comment puis-je cultiver de meilleures relations au travail ?",
        stream: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        tags: { name: "IrisMessage" },
      }
    );
    const irisDuration = new Date().getTime() - tIris0;
    irisTtft.add(irisDuration);

    const irisOk = check(irisRes, {
      "iris status is 200 or 402": (r) => r.status === 200 || r.status === 402,
      "not timed out": (r) => r.status !== 0 && r.status !== 504 && r.timings.duration < 60000,
    });
    if (!irisOk) unexpectedStatusRate.add(1);
  }

  sleep(1);
}

export function handleSummary(data) {
  // Masquage et suppression systématique des cookies / jetons de setup_data
  if (data.setup_data) {
    delete data.setup_data;
  }
  return {
    "raw/k6-summary.json": JSON.stringify(data, null, 2),
  };
}

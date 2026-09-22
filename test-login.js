fetch("http://localhost:3000/auth/login")
  .then(res => res.text().then(text => {
    console.log("STATUS:", res.status);
    const match = text.match(/<title>(.*?)<\/title>/);
    if (match) console.log("TITLE:", match[1]);
    
    // In dev mode Next.js wraps the error in a specific div or nextjs-portal.
    // We can try to extract the error message if it's there.
    const errMatch = text.match(/Error: (.*?)(?:<|\\n)/);
    if (errMatch) console.log("ERROR:", errMatch[1]);
    else if (res.status === 500) console.log("TEXT START:", text.substring(0, 500));
  }))
  .catch(console.error);

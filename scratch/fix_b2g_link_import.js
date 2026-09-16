const fs = require('fs');

const b2gPath = 'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx';
let b2gContent = fs.readFileSync(b2gPath, 'utf8');

if (!b2gContent.includes('import Link from "next/link";')) {
  b2gContent = b2gContent.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect } from "react";\nimport Link from "next/link";'
  );
  fs.writeFileSync(b2gPath, b2gContent);
  console.log('Added Link import to b2g!');
} else {
  console.log('Link import already exists in b2g.');
}

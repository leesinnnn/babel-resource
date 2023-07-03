import React from 'react'
import intl from "intl2";
/**
 * App
 */
function App() {
  const title1 = "title"
  const title2 = "title"
  const desc = `desc`;
  const desc2 = /*i18n-disable*/ `desc`;
  const desc3 = `aaa ${title1 + desc} bbb ${desc2} ccc`;

  return (
    <div className="app" title={"测试"}>
      <h1>{title1}</h1>
      <h1>{title2}</h1>
      <p>{desc}</p>
      <p>{desc2}</p>
      <div>{/*i18n-disable*/ "中文"}</div>
    </div>
  );
}

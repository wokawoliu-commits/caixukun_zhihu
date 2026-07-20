import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the education data comparison audit", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]+lang="zh-CN"/i);
  assert.match(html, /<title>京学龄·差异审计｜官方招生数与8篇文章对比<\/title>/i);
  assert.match(html, /为什么出现/);
  assert.match(html, /81\.35%/);
  assert.match(html, /80\.82%/);
  assert.match(html, /92%/);
  assert.match(html, /西城区/);
  assert.match(html, /朝阳区/);
  assert.match(html, /逐篇核验/);
  assert.match(html, /打开原文/);
});

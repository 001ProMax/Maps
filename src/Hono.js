import { Hono } from "hono";
import { fetch } from "@nsnanocat/util";
import { Response } from "./process/Response.mjs";
import { Request } from "./process/Request.mjs";
/***************** Processing *****************/
export default new Hono().all("/:rest{.*}", async c => {
	/* todo */
	// globalThis.$arguments = url.searchParams.get("Weather_Provider");

	const url = new URL(c.req.url);
	switch (true) {
		case url.hostname.startsWith("configuration.ls."):
			url.hostname = "configuration.ls.apple.com";
			break;
		case url.hostname.startsWith("gspe35-ssl.ls."):
			url.hostname = "gspe35-ssl.ls.apple.com";
			break;
		default:
		case url.hostname.endsWith(".workers.dev"): {
			const [host, ...path] = c.req.param("rest").split("/");
			url.protocol = "https:";
			url.hostname = host;
			url.port = "443";
			url.pathname = path.join("/");
			break;
		}
	}
	const raw = await c.req.arrayBuffer();
	let $request = {
		method: c.req.method,
		url: url.toString(),
		headers: c.req.header(),
		body: raw.byteLength > 0 ? new TextDecoder().decode(raw) : undefined,
		bodyBytes: raw.byteLength > 0 ? raw : undefined,
	};
	let $response;
	({ $request, $response } = await Request($request));
	if (!$response) {
		$response = await fetch($request);
		$response = await Response($request, $response);
		delete $response.headers["content-length"];
	}
	Object.keys($response.headers).map(k => c.header(k, $response.headers[k]));
	return c.body($response.body);
});

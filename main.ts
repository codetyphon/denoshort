import { Application, Router, Context, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import * as base62 from 'https://deno.land/x/base62/mod.ts';
import * as baseEmoji from 'https://deno.land/x/baseemoji/mod.ts';
import { Store } from 'https://deno.land/x/store@v1.2.0/mod.ts'

const store = new Store({
    name: 'cachedata',
    path: './store'
});

const app = new Application();
const port = 3000;

const router = new Router();
router
    .get("/", async ({ request, response, params }: Context | any) => {
        const _file = await Deno.readFile('./view/index.html');
        const decoder = new TextDecoder();
        response.body = await decoder.decode(_file);
    })
    .get("/api", async ({ request, response, params }: Context | any) => {
        const _file = await Deno.readFile('./view/api.html');
        const decoder = new TextDecoder();
        response.body = await decoder.decode(_file);
    })
    .get("/style", async ({ request, response, params }: Context | any) => {
        const _file = await Deno.readFile('./static/spectre.min.css');
        const decoder = new TextDecoder();
        response.headers.set("content-type", "text/css");
        response.body = await decoder.decode(_file);
    })
    .get("/:code", async ({ request, response, params }: Context | any) => {
        const { code } = params;
        const url = await store.get(code);
        if (url) {
            response.redirect(url);
        } else {
            const _file = await Deno.readFile('./view/404.html');
            const decoder = new TextDecoder();
            response.body = await decoder.decode(_file);
        }
    })
    .post("/", async ({ request, response, params }: Context | any) => {
        const { url, type } = await request.body({ type: 'json' }).value;
        const last_id = await store.get('id') || 10000;
        const new_id = last_id + 1;
        let str;
        if (type == "emoji") {
            str = baseEmoji.encode(new_id);
        } else {
            str = base62.encode(new_id);
        }
        await store.set(str, url);
        await store.set('id', new_id);
        response.body = str;
    })
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
app.addEventListener('listen', () => {
    console.log(`Listening on: localhost:${port}`);
});

app.listen({ port: port });
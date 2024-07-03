import { Hono } from "hono";

const markup = `
<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"  />
    <script src="https://unpkg.com/htmx.org@2.0.0"></script>
    <title>DNS Resolve Utility</title>
  </head>
  <body>
    <main class="container">
      <form>
        <fieldset class="grid">
          <input type="text" value="jcw.sensus-analytics.com" size="40" name="name" />
          <input type="submit" onclick="event.preventDefault()" 
            hx-post="/resolve" hx-swap="innerHTML" 
            hx-trigger="click" hx-target="#resolve-response-id" 
            value="Submit to resolve"/>
        </fieldset>
      </form>
      <article id="resolve-response-id">
        <kbd>v1.0.0</kbd>
      </article>    
    </main>
  </body>
</html>`;

const app = new Hono();

app.get("/", (c) => {
  return c.html(markup);
});

app.get("/resolve", async (c) => {
  const { name } = c.req.query();
  const msgs = await resolveName(name);
  return c.text(msgs.join("\n"));
});

app.post("/resolve", async (c) => {
  const formData = await c.req.formData();
  const name = formData.get("name");
  const msgs = await resolveName(name);
  
  return c.html(`<div>
      Resolving: <b>${name}</b>
      <br/>
      <li> ${msgs.join("<li>")}
    </div>`);
});

async function resolveName(name: string): Promise<string[]> {
  const msgs: string[] = [];
  try {
    const result = await Deno.resolveDns(name, "CNAME");
    msgs.push(result.join(`\n`));
  } catch (error) {
    msgs.push(`ERROR: ${error.message}`);
  }

  return msgs;
}

Deno.serve(app.fetch);

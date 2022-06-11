import { LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code == null) return {};

  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code,
  };

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { Accept: "application/json" },
  });

  const { access_token } = await response.json();

  session.set("access_token", access_token);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const redirect_url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_url=${process.env.GITHUB_REDIRECT_URL}&scope=user`;

  return redirect(redirect_url);
};

export default function Login() {
  return (
    <Form method="post">
      <button type="submit">Entre com sua conta GitHub</button>
    </Form>
  );
}

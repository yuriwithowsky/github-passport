import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import axios from "axios";
import fetch from "node-fetch";
type User = {
  login: string;
  avatar_url: string;
  name: string;
};

type LoaderData = {
  user: User;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code == null) return {};

  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code,
  };

  const response = await axios.post(
    "https://github.com/login/oauth/access_token",
    body,
    { headers: { Accept: "application/json" } }
  );

  const { data } = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `token ${response.data.access_token}` },
  });
  return json<LoaderData>({ user: data });
};

export const action: ActionFunction = async ({ request }) => {
  console.log("entra aqui");
  const redirect_url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_url=http://localhost:3000/&scope=user`;

  return redirect(redirect_url);
};

export default function Index() {
  const { user } = useLoaderData<LoaderData>();
  if (!user)
    return (
      <Form method="post">
        <button type="submit">Entre com sua conta GitHub</button>
      </Form>
    );
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <h2>{user.name}</h2>
      <span>{user.login}</span>
      <img src={user.avatar_url} />
    </div>
  );
}

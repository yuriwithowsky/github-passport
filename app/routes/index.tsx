import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";

type User = {
  login: string;
  avatar_url: string;
  name: string;
};

type LoaderData = {
  user: User;
};

export const loader: LoaderFunction = async ({ request }) => {
  var session = await getSession(request.headers.get("Cookie"));
  const token = session.get("access_token");

  const res = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: { Authorization: `token ${token}` },
  });

  if (res.status === 401) return redirect("/login");

  const user = await res.json();

  return json<LoaderData>({ user });
};

export default function Index() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome, {user.name}!</h1>
      <h2>{user.name}</h2>
      <span>{user.login}</span>
      <img src={user.avatar_url} />
    </div>
  );
}

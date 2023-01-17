import Head from "next/head";
import { Inter } from "@next/font/google";
import { format } from "path";
import { setFlagsFromString } from "v8";
import { useState } from "react";
import { prisma } from "../lib/prisma";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

interface FormData {
  title: string;
  content: string;
  id: string;
}

interface Posts {
  posts: {
    title: string;
    content: string;
    id: string;
  }[];
}

export default function Home({ posts }: Posts) {
  const [form, setForm] = useState<FormData>({
    title: "",
    content: "",
    id: "",
  });
  const router = useRouter();

  async function createPost(data: FormData) {
    try {
      fetch("http://localhost:3000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(() => {
        setForm({ title: "", content: "", id: "" });
        refreshData();
      });
    } catch (error) {
      console.log(error);
    }
  }

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await createPost(data);
    } catch (error) {
      console.log(error);
    }
  };

  async function deletePost(id: string) {
    try {
      fetch(`http://localhost:3000/api/post/${id}`, {
        method: "DELETE",
      }).then(() => {
        refreshData();
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <div className="card w-96 bg-base-100 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(form);
            }}
          >
            <div className="card-body">
              <h2 className="card-title">Post</h2>
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input w-full max-w-xs"
              ></input>
              <textarea
                placeholder="Content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="textarea"
              ></textarea>
              <button className="btn" type="submit">
                Add +
              </button>
            </div>
          </form>
        </div>
        <div>
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <button className="btn" onClick={() => deletePost(post.id)}>
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const posts = await prisma.post.findMany({
    select: {
      title: true,
      id: true,
      content: true,
    },
  });
  return {
    props: {
      posts,
    },
  };
};

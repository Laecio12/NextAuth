import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest<p>(fn: GetServerSideProps<p>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<p>> => {
    const cookies = parseCookies(ctx);

    if(cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/Dashboard',
          permanent: false,
        }
      }
    }
    return await fn(ctx);
  }
}
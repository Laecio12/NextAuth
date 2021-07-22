import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenErrors";
import  decode  from "jwt-decode"
import { validateUserPermissions } from "./validateUserPermissions";

type withSSRAuthOptions = {
  permissions: string[];
  roles: string[];
}

export function withSSRAuth<p>(fn: GetServerSideProps<p>, options?: withSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<p>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token']

    if(!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    if(options) {
      const user = decode<{permissions: string[], roles: string[]}>(token);
      const { permissions, roles } = options;
      const userHasValidPermissions = validateUserPermissions({
    
      user,
      permissions, 
      roles
    })
    
    if(userHasValidPermissions) {
      return {

          redirect:{ 
            destination:'/dashboard',
            permanent: false
          }
        }
      }
    }
    try {
      return await fn(ctx);
      
    } catch (err) {
      if(err instanceof AuthTokenError) {
        destroyCookie(ctx, cookies['nextauth.token'])
      destroyCookie(ctx, cookies['nextauth.refreshToken'])

        return { 
          redirect: {
          destination: '/',
          permanent: false,
          }
      
        }
      }
      
    }
  }
}
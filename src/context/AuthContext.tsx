import { createContext, ReactNode, useEffect, useState } from 'react';
import Router from 'next/router'
import { api } from '../services/apiClient';
import { setCookie, parseCookies, destroyCookie } from 'nookies'

 type SignInCredentials = {
   email: string;
   password: string;
 }
 type User = {
   email: string;
   permissions: string[];
   roles: string[];
 }

 type AuthContextData = {
   signIn: (credentials: SignInCredentials) => Promise<void>;
   signOut: () =>  void;
   user: User;
   isAuthenticated: boolean;
 }
 type AuthProviderProps = {
   children: ReactNode
 }
 export const AuthContext = createContext({} as AuthContextData)
 let authChanel : BroadcastChannel
 
 export function signOut() {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')

  authChanel.postMessage('signOut');

  Router.push('/')
 }
 
 export function AuthProvider({children}: AuthProviderProps) {
  
   const [user, setUser] = useState<User>();
   const isAuthenticated = !!user;

   useEffect(() => {
     authChanel = new BroadcastChannel('auth')
     authChanel.onmessage = (message) => {
       switch (message.data) {
         case 'signOut':
           signOut();
           break;
           default: break;
       }
     }
   })

   useEffect(() => {
     const {'nextauth.token': token} = parseCookies()

     if(token ) {
       api.get('/me').then(response => {
         const {email, permissions, roles} = response.data

         setUser({email, permissions, roles})
       }).catch(() => {
        signOut()
       })

     }

   }, [])

   async function signIn({email, password}: SignInCredentials) {
      try {
        
        const response = await api.post('/sessions', {
    
          email,
          password,
        })

        const {token, refreshToken, permissions, roles} = response.data;

        setCookie(undefined, 'nextauth.token', token, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        });
        setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        });

        setUser({
          email,
          permissions,
          roles
        })
        
        api.defaults.headers['Authorization'] = `Bearer ${token}`
       
      
        authChanel.postMessage('signIn')
      } catch (error) {
        console.log(error)
      }
   }

   return (
     <AuthContext.Provider value={{signIn, signOut, isAuthenticated, user}}>
     {children} 
     
     </AuthContext.Provider>
   )
 } 
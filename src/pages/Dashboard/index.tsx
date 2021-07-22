import { useContext, useEffect } from 'react'
import { AuthContext } from "../../context/AuthContext"
import { setupApiClient } from '../../services/api'
import { api } from '../../services/apiClient'
import { withSSRAuth } from '../../utils/withSSRAuth'
import { Can } from '../../components/Can'

export default function Dashboard() {
  const {user, signOut } = useContext(AuthContext)

  useEffect(() => {
    api.get('/me')
    .then(response => console.log(response))
    .catch(err => console.log(err))
  }, []) 

  return (
    <>
    <h1>Bem vindo: {user?.email}</h1>
    <button onClick={signOut} >Sign out</button>
    <Can permissions={['metrics.list']}>
      <div> Metrics</div> 
    </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async(ctx) => {
  const apiClient = setupApiClient(ctx);
  const response = await apiClient.get('/me');

  console.log(response.data)
  return {
    props: {}
  }
})
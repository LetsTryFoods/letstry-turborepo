
import { redirect } from 'next/navigation'

function page() {


  redirect('/dashboard')

  return (
    <div className=' w-screen h-screen flex justify-center items-center'>Redirection ...</div>
  )
}

export default page

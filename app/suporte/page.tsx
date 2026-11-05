import {SupportPanel} from '@/components/hotel/support-panel'
import {createClient} from '@/lib/supabase/server'
import {notFound} from 'next/navigation'
export default async function Page(){const client=await createClient();const {data,error}=await client.auth.getUser();if(error||data.user?.app_metadata?.hotel_internal_support!==true)notFound();return <SupportPanel operator/>}

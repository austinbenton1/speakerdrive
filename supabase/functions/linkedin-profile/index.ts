import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface LinkedInProfileData {
  name?: string;
  headline?: string;
  company?: string;
  profilePicture?: string;
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      })
    }

    // Get access token from request
    const { accessToken } = await req.json()
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch basic profile information
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile data')
    }

    const profileData = await profileResponse.json()

    // Fetch current position using v2 API
    const positionResponse = await fetch('https://api.linkedin.com/v2/positions?q=member&projection=(elements*(title,company~(name)))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    const positionData = await positionResponse.json()
    const currentPosition = positionData?.elements?.[0]

    // Construct the response data
    const linkedInData: LinkedInProfileData = {
      name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
      headline: currentPosition?.title || profileData.headline,
      company: currentPosition?.['company~']?.name,
      profilePicture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
    }

    return new Response(
      JSON.stringify(linkedInData),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    )
  }
})

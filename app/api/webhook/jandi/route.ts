import * as Sentry from '@sentry/nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { IS_DEV } from 'services'

export async function POST(req: Request) {
  const { webhookUrl } = await req.json()
  if (!webhookUrl)
    return NextResponse.json({
      success: false,
      message: 'URL이 전달되지 않았습니다.'
    })
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { error } = await supabase
    .from('connections')
    .insert({ jandi_webhook_url: webhookUrl })
  if (error) {
    console.log(error)
    if (!IS_DEV) Sentry.captureException(error)
    return NextResponse.json({
      success: false,
      message:
        '에러가 발생했습니다. 문제가 지속된다면 https://a22k.short.gy/VniaWA 에서 문의바랍니다.'
    })
  }
  await fetch(webhookUrl, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      body: '**[일간 ProductHunt]** 성공적으로 연결되었습니다.'
    }),
    cache: 'no-cache'
  })
  return NextResponse.json({ success: true, message: '완료되었습니다.' })
}

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ReferralTrackerProps {
  productId?: string
}

export function ReferralTracker({ productId }: ReferralTrackerProps) {
  const router = useRouter()

  useEffect(() => {
    const trackReferral = async () => {
      // Функция для получения cookie
      const getCookie = (name: string) => {
        return document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1]
      }

      // Получаем реферальный код и UTM метки из cookie
      const referralCode = getCookie('referral_code')
      const utmSource = getCookie('utm_source')
      const utmMedium = getCookie('utm_medium')
      const utmCampaign = getCookie('utm_campaign')
      const utmTerm = getCookie('utm_term')
      const utmContent = getCookie('utm_content')
      const firstVisit = getCookie('referral_first_visit')

      if (referralCode && utmSource === 'referral') {
        try {
          // Отправляем данные о реферальном переходе на сервер
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fubamarket.com/'}/api/referral-visits/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              referral_code: referralCode,
              product_id: productId,
              page_url: window.location.href,
              user_agent: navigator.userAgent,
              ip_address: '', // Будет получен на сервере
              utm_source: utmSource,
              utm_medium: utmMedium,
              utm_campaign: utmCampaign,
              utm_term: utmTerm,
              utm_content: utmContent,
              first_visit: firstVisit,
              current_visit: new Date().toISOString()
            })
          })

          console.log('✅ Referral visit tracked successfully:', {
            referralCode,
            utmSource,
            utmMedium,
            utmCampaign,
            productId
          })

          // НЕ очищаем cookie - они должны сохраняться на 30 дней
          // Cookie будут автоматически удалены через 30 дней
        } catch (error) {
          console.error('Error tracking referral visit:', error)
        }
      }
    }

    trackReferral()
  }, [productId])

  return null // Этот компонент не рендерит ничего
}

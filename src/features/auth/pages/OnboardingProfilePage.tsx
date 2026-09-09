import { Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

import { ProfileInputForm } from "../components/ProfileInputForm"

/* ChevronLeft(뒤로 가기) : 현재 페이지에서 뒤로(-1) 가는 것이지만 주소를 직접 지정하여 가는 것으로 함. */

export default function OnboardingProfilePage() {
  const Icon = ChevronLeft

  return (
    <div className="mx-auto max-w-md flex flex-col items-center">
      <div className="flex flex-row text-xl gap-1.5 p-5">
        <Link to="/onboarding/phone" aria-label="뒤로"><Icon /></Link>
        <h2 className="font-medium">자기소개서 작성</h2>
      </div>
      <ProfileInputForm />
    </div>
  )
}

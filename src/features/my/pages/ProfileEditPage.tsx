import { Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { ProfileEditForm } from "../components/ProfileEditForm"

/**
 * 자기소개서 수정 — /my/profile/edit · docs/ia.md 8절
 * 작성 화면(OnboardingProfilePage)과 달리 마이로 돌아갈 수 있어 뒤로가기 버튼이 있다.
 */
export default function ProfileEditPage() {
  return (
    <div className="mx-auto max-w-md flex flex-col items-center">
      <div className="flex flex-row text-xl gap-1.5 p-5 w-full">
        <Link to="/my"><ChevronLeft /></Link>
        <h2 className="font-medium">자기소개서 수정</h2>
      </div>
      <ProfileEditForm />
    </div>
  )
}
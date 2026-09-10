import { ProfileInputForm } from "../components/ProfileInputForm"

/**
 * 자기소개서 작성 — /onboarding/profile · docs/ia.md 2절
 *
 * 전화번호 인증 화면이 빠져서(2026-09-10) 이 화면이 온보딩의 첫 단계다.
 * 뒤로 갈 곳이 없으므로 뒤로가기 버튼을 두지 않는다.
 */
export default function OnboardingProfilePage() {
  return (
    <div className="mx-auto max-w-md flex flex-col items-center">
      <div className="flex flex-row text-xl gap-1.5 p-5">
        <h2 className="font-medium">자기소개서 작성</h2>
      </div>
      <ProfileInputForm />
    </div>
  )
}

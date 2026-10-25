import { useState } from "react"
import { MyListItem } from "../components/MyListItem"
import { useLogout } from "../api/useLogout"

/**
 * 마이 — /my · docs/ia.md
 * 신고하기는 펼치면 신고서 작성·목록이 나온다.
 * TODO: 신고서 작성은 마이에서 접근할 때 targetId를 어떻게 할지 정해지지 않아 이동을 비워 둔다.
 * 채팅·통화에서는 상대 ID가 있지만 마이에는 없다.
 */
const REPORT_SUB_ITEMS = [
  { title: "신고서 작성", to: undefined },
  { title: "신고서 목록", to: "/my/reportlist" },
]

export default function MyPage() {
  const [isReportOpen, setIsReportOpen] = useState(false)
  const { mutate: logout } = useLogout()

  return (
    <div className="mx-auto max-w-md">
      <h1 className="px-4 py-3 text-lg font-semibold">마이 페이지</h1>

      <div className="divide-y">
        <MyListItem
          title="개인 정보 수정"
          description="자기소개서 수정"
          to="/my/profile/edit"
        />

        <div>
          <MyListItem
            title="신고하기"
            description="신고서 작성 및 신고서 목록"
            expandable
            expanded={isReportOpen}
            onClick={() => setIsReportOpen((v) => !v)}
          />
          {isReportOpen &&
            REPORT_SUB_ITEMS.map((item) => <MyListItem key={item.title} {...item} />)}
        </div>

        <MyListItem
          title="환경설정"
          description="권한 설정, 계정, 약관, 개선점 보내기"
          to="/my/settings"
        />
        <MyListItem
          title="로그아웃"
          description="현재 계정에서 로그아웃하기"
          onClick={() => logout()}
        />
      </div>
    </div>
  )
}
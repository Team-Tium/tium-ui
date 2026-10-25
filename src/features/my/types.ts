import type { components } from "@/shared/api/schema"

type RawMyProfile = components["schemas"]["MyProfileDTO"]

/** features/auth의 MemberProfile과 같은 응답에서 개인 정보 수정 화면에 필요한 필드만 뽑았다. */
export type MyProfile = Pick<RawMyProfile, "name" | "email" | "address" | "gender" | "birthDate">
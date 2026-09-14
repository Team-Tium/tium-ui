import { z } from "zod"

/** 성별. 백엔드 `Gender` enum 값과 그대로 맞춘다. docs/users_api.md §2 */
export const GENDERS = ["MALE", "FEMALE"] as const
export type Gender = (typeof GENDERS)[number]

export const PROFILE_VALIDSCHEMA = z.object({
    name: z
    .string()
    .min(2, "이름을 입력하세요")
    .max(20, "이름은 20자 이하로 입력해주세요")
    .regex(/^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z]+$/, "한글과 영어만 입력 가능합니다"),

    birthdate: z
    .string()
    .min(1, "생년월일을 입력해주세요")
    .regex(/^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/, "입력 형식 : YYYYMMDD"),

    baseAddress: z
    .string()
    .min(2, "주소를 입력해주세요"),

    detailAddress: z
    .string(),

    email: z
    .email("이메일 형식 : example@email.com")
    .min(1, "이메일을 입력해주세요"),

    gender: z.enum(GENDERS, { error: "성별을 선택해주세요" })
})

export type ProfileValidSchema = z.infer<typeof PROFILE_VALIDSCHEMA>

/** 텍스트 input 하나의 설정. 성별은 라디오라 여기 들어가지 않는다(GENDER_OPTIONS 참고). */
export interface InputConfig {
    id: Exclude<keyof ProfileValidSchema, "gender">,
    label: string,
    type: "text",
    placeholder: string
}

export const INPUTCONFIG_BEFORE_ADDRESS : InputConfig[] = [
    { id: "name", label: "이름", type: "text", placeholder: "이름을 작성하세요" },
    { id: "birthdate", label: "생년월일", type: "text", placeholder: "생년월일을 작성하세요" }
]

export const INPUTCONFIG_ADDRESS : { base: InputConfig; detail: InputConfig } = {
   base: { id: "baseAddress", label: "주소", type: "text", placeholder: "주소를 입력하세요" },
   detail: { id: "detailAddress", label: "", type: "text", placeholder: "상세 주소를 입력하세요(선택)" },
}

export const INPUTCONFIG_AFTER_ADDRESS : InputConfig[] = [
    { id: "email", label: "이메일", type: "text", placeholder: "이메일을 입력하세요" }
]

/* 피그마 Onboarding page 3의 "정보1" 칸 = 성별로 확정 (2026-09-09). docs/ia.md 2절 */
export const GENDER_OPTIONS : { value: Gender; label: string }[] = [
    { value: "MALE", label: "남성" },
    { value: "FEMALE", label: "여성" }
]
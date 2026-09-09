import { z } from "zod"

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

    mbti: z
    .string()
    .min(1, "MBTI를 작성해주세요")
    .regex(/^[EI][SN][TF][JP]$/i, "입력 형식에 맞춰 작성해주세요")
})

export type ProfileValidSchema = z.infer<typeof PROFILE_VALIDSCHEMA>

export interface InputConfig {
    id: keyof ProfileValidSchema,
    label: string,
    type: "text",
    placeholder: string
}

export const INPUTCONFIG_BEFORE_ADDRESS : InputConfig[] = [
    { id: "name", label: "이름", type: "text", placeholder: "이름을 작성하세요" },
    { id: "birthdate", label: "생년월일", type: "text", placeholder: "생년월일을 작성하세요" }
]

export const INPUTCONFIG_ADDRESS : { base: InputConfig; detail: InputConfig } = {
   base: { id: "baseAddress", label: "주소", type: "text", placeholder: "주소 찾기를 클릭하세요" },
   detail: { id: "detailAddress", label: "", type: "text", placeholder: "상세 주소를 입력하세요(선택)" },
}

/* TODO : 정보 1(피그마 내 Onboarding page 3에서 이메일 아래에 있는 input bar)의 확정 */
export const INPUTCONFIG_AFTER_ADDRESS : InputConfig[] = [
    { id: "email", label: "이메일", type: "text", placeholder: "이메일을 입력하세요" },
    { id: "mbti", label: "MBTI", type: "text", placeholder: "MBTI를 입력하세요" }
]
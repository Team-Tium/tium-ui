import { useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"

import { PROFILE_VALIDSCHEMA, type ProfileValidSchema, INPUTCONFIG_BEFORE_ADDRESS, INPUTCONFIG_ADDRESS, INPUTCONFIG_AFTER_ADDRESS, GENDER_OPTIONS } from "@/shared/constants/inputconfig"
import { AddressSearchModal } from '@/shared/components/AddressSearchModal'
import { useSubmitProfile } from "../api/useSubmitProfile"

/** 자기소개서 작성 페이지의 input form 컴포넌트
 * 피그마 Onboarding page 3 기준 — 이름 → 생년월일 → 주소 → 이메일 → 성별 순.
 * 주소는 모달이 있어야 하기에 주소를 기준으로 나누어 작성함.
 */

/** 폼은 YYYYMMDD 로 받고 API 는 yyyy-MM-dd 를 받는다. docs/users_api.md §2 */
function toIsoDate(yyyymmdd: string) {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
}

export function ProfileInputForm() {
    const { mutate, isPending, isError, error } = useSubmitProfile()

    const {
        register,
        setValue,
        trigger,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<ProfileValidSchema>({
        resolver: zodResolver(PROFILE_VALIDSCHEMA),
        mode: "onChange",
    })

    const [isModalOpen, setIsModalOpen] = useState(false)

    const onSubmit = (data: ProfileValidSchema) => {
        /* 폼 형태 → API 형태로 변환. 주소는 기본+상세를 한 문자열로 합쳐 보낸다. */
        mutate({
            name: data.name,
            birthDate: toIsoDate(data.birthdate),
            address: [data.baseAddress, data.detailAddress].filter(Boolean).join(' ').trim(),
            email: data.email,
            gender: data.gender,
        })
    }

    return (
        <div>
            <form className="flex flex-col p-5" onSubmit={handleSubmit(onSubmit)}>
                {INPUTCONFIG_BEFORE_ADDRESS.map((input) => { /* 이름, 생년월일에 대한 input form */
                    const errorMessage = errors[input.id]?.message

                    return (
                        <div key={input.id} className="flex flex-col mb-10">
                            <label className="font-medium" htmlFor={input.id}>{input.label}</label>
                            <input className="input p-1 border border-sidebar-border rounded-md placeholder:text-muted-foreground"
                             id={input.id} type={input.type} placeholder={input.placeholder}
                             {...register(input.id)} />
                            { errorMessage && (
                                <span className="text-destructive text-xs p-1">{errorMessage}</span>
                            )}
                        </div>
                    )
                })}

                <div className="flex flex-col mb-10">
                    <div className="flex flex-col pb-1">
                        <label className="font-medium" htmlFor={INPUTCONFIG_ADDRESS.base.id}>{INPUTCONFIG_ADDRESS.base.label}</label>
                        <input className="input p-1 border border-sidebar-border rounded-md placeholder:text-muted-foreground"
                         id={INPUTCONFIG_ADDRESS.base.id} type={INPUTCONFIG_ADDRESS.base.type}
                         placeholder={INPUTCONFIG_ADDRESS.base.placeholder} readOnly
                        {...register(INPUTCONFIG_ADDRESS.base.id)} onClick={() => setIsModalOpen(true)} />
                        { errors.baseAddress && (
                            <span className="text-destructive text-xs p-1">{errors.baseAddress.message}</span>
                        )}
                    </div>
                    <input className="input p-1 border border-sidebar-border rounded-md placeholder:text-muted-foreground"
                        id={INPUTCONFIG_ADDRESS.detail.id} type={INPUTCONFIG_ADDRESS.detail.type}
                        placeholder={INPUTCONFIG_ADDRESS.detail.placeholder}
                        {...register(INPUTCONFIG_ADDRESS.detail.id)} />
                </div>

                {INPUTCONFIG_AFTER_ADDRESS.map((input) => { /* 이메일에 대한 input form */
                    const errorMessage = errors[input.id]?.message

                    return (
                        <div key={input.id} className="flex flex-col mb-10">
                            <label className="font-medium" htmlFor={input.id}>{input.label}</label>
                            <input className="input p-1 border border-sidebar-border rounded-md placeholder:text-muted-foreground"
                             id={input.id} type={input.type} placeholder={input.placeholder}
                             {...register(input.id)} />
                            { errorMessage && (
                                <span className="text-destructive text-xs p-1">{errorMessage}</span>
                            )}
                        </div>
                    )
                })}

                <fieldset className="flex flex-col mb-10"> {/* 성별 — 값이 2개뿐이라 라디오로 받는다 */}
                    <legend className="font-medium">성별</legend>
                    <div className="flex gap-6 pt-2">
                        {GENDER_OPTIONS.map((option) => (
                            <label key={option.value} className="flex items-center gap-1.5">
                                <input type="radio" value={option.value} {...register("gender")} />
                                {option.label}
                            </label>
                        ))}
                    </div>
                    { errors.gender && (
                        <span className="text-destructive text-xs p-1">{errors.gender.message}</span>
                    )}
                </fieldset>

                { isError && ( /* 저장 실패를 알려주지 않으면 사용자는 눌렀는데 아무 일도 안 난 걸로 본다 */
                    <p className="text-destructive text-sm text-center mb-2">
                        {error instanceof Error ? error.message : "저장에 실패했어요. 잠시 후 다시 시도해 주세요."}
                    </p>
                )}

                <Button type="submit" size="lg" className="w-full self-center mt-4"
                  disabled={!isValid || isSubmitting || isPending}>작성 완료</Button>

                <AddressSearchModal /* 기본 주소의 input bar를 클릭 시 띄워질 Modal */
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    setValue={setValue}
                    trigger={trigger}
                />
            </form>
        </div>
    )
}

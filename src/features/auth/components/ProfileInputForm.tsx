import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"

import { PROFILE_VALIDSCHEMA, type ProfileValidSchema, INPUTCONFIG_BEFORE_ADDRESS, INPUTCONFIG_ADDRESS, INPUTCONFIG_AFTER_ADDRESS } from "@/shared/constants/inputconfig"
import { AddressSearchModal } from '@/shared/components/AddressSearchModal'
import { useSubmitProfile } from "../api/useSubmitProfile"

/** 자기소개서 작성 페이지의 input form 컴포넌트
 * 주소는 모달이 있어야 하기에 주소를 기준으로 나누어 작성함. 
 */

export function ProfileInputForm() {
    const navigate = useNavigate()
    const { mutate, isPending } = useSubmitProfile()

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
        mutate(data, {
            onSuccess: () => navigate("/onboarding/permission"),
        })
    }

    return (
        <div>
            <form className="flex flex-col p-5" onSubmit={handleSubmit(onSubmit)}>
                {INPUTCONFIG_BEFORE_ADDRESS.map((input) => { /* 이름, 생년월일에 대한 input form */
                    const errorMessage = errors[input.id]?.message

                    return (
                        <div key={input.id} className="flex flex-col mb-10">
                            <label className="font-medium">{input.label}</label>
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
                        <label className="font-medium">{INPUTCONFIG_ADDRESS.base.label}</label>
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

                {INPUTCONFIG_AFTER_ADDRESS.map((input) => { /* email과 MBTI에 대한 input form */
                    const errorMessage = errors[input.id]?.message

                    return (
                        <div key={input.id} className="flex flex-col mb-10">
                            <label className="font-medium">{input.label}</label>
                            <input className="input p-1 border border-sidebar-border rounded-md placeholder:text-muted-foreground"
                             id={input.id} type={input.type} placeholder={input.placeholder}
                             {...register(input.id)} />
                            { errorMessage && (
                                <span className="text-destructive text-xs p-1">{errorMessage}</span>
                            )}
                        </div>
                    )
                })}

                <Button type="submit" className={`size-lg w-fll self-center mt-4 ${isValid ? "bg-primary-press" : "bg-muted-foreground"}`} 
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
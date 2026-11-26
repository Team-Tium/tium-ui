import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/shared/components/ui/button"
import { ListState } from "@/shared/components/ListState"
import { PROFILE_VALIDSCHEMA, type ProfileValidSchema, INPUTCONFIG_BEFORE_ADDRESS, INPUTCONFIG_ADDRESS, GENDER_OPTIONS } from "@/shared/constants/inputconfig"
import { AddressSearchModal } from "@/shared/components/AddressSearchModal"
import { useMyProfile } from "../api/useMyProfile"
import { useUpdateProfile } from "../api/useUpdateProfile"

/** 서버는 yyyy-MM-dd, 폼은 YYYYMMDD. docs/users_api.md §2 */
function toIsoDate(yyyymmdd: string) {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
}

/** 미리 채울 때만 쓴다. 폼 검증 정규식이 하이픈을 허용하지 않아 그대로 넣으면 에러가 난다 */
function toFormDate(iso: string | undefined) {
  return iso ? iso.replaceAll("-", "") : ""
}

export function ProfileEditForm() {
  const { data: me, isPending: isLoading, isError: isLoadError } = useMyProfile()
  const { mutate, isPending, isError, error } = useUpdateProfile()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    register,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<ProfileValidSchema>({
    resolver: zodResolver(PROFILE_VALIDSCHEMA),
    mode: "onChange",
    // TODO: 서버는 주소를 한 문자열로만 줘서 기본/상세로 나눌 기준이 없다(docs/users_api.md §1).
    // 전체를 기본 주소 칸에 넣고 상세 주소는 비운다.
    // as: 서버 값은 null일 수 있어 폼 스키마(필수)와 타입이 맞지 않는다. 온보딩을 마친 회원이라 값이 있다고 본다.
    values: me && {
      name: me.name ?? "",
      birthdate: toFormDate(me.birthDate),
      baseAddress: me.address ?? "",
      detailAddress: "",
      gender: me.gender ?? undefined,
    } as ProfileValidSchema,
  })

  const onSubmit = (data: ProfileValidSchema) => {
    mutate({
      name: data.name,
      birthDate: toIsoDate(data.birthdate),
      address: [data.baseAddress, data.detailAddress].filter(Boolean).join(" ").trim(),
      gender: data.gender,
    })
  }

  return (
    <ListState
      isLoading={isLoading}
      isError={isLoadError}
      isEmpty={false}
      errorText="내 정보를 불러오지 못했어요."
    >
      <div className="w-full">
        <form className="flex flex-col p-5" onSubmit={handleSubmit(onSubmit)}>
          {INPUTCONFIG_BEFORE_ADDRESS.map((input) => {
            const errorMessage = errors[input.id]?.message
            return (
              <div key={input.id} className="flex flex-col mb-10">
                <label className="font-medium" htmlFor={input.id}>{input.label}</label>
                <input className="input p-1 border border-sidebar-border rounded-md placeholder:text-muted-foreground"
                  id={input.id} type={input.type} placeholder={input.placeholder}
                  {...register(input.id)} />
                {errorMessage && <span className="text-destructive text-xs p-1">{errorMessage}</span>}
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
              {errors.baseAddress && <span className="text-destructive text-xs p-1">{errors.baseAddress.message}</span>}
            </div>
            <input className="input p-1 border border-sidebar-border rounded-md placeholder:text-muted-foreground"
              id={INPUTCONFIG_ADDRESS.detail.id} type={INPUTCONFIG_ADDRESS.detail.type}
              placeholder={INPUTCONFIG_ADDRESS.detail.placeholder}
              {...register(INPUTCONFIG_ADDRESS.detail.id)} />
          </div>

          {/* 서버가 저장한 소셜 로그인 값이라 수정할 수 없다. 없으면 칸을 숨긴다 */}
          {me?.email && (
            <div className="flex flex-col mb-10">
              <label className="font-medium" htmlFor="email">이메일</label>
              <input className="input p-1 border border-sidebar-border rounded-md bg-muted text-muted-foreground"
                id="email" type="email" value={me.email} readOnly />
            </div>
          )}

          <fieldset className="flex flex-col mb-10">
            <legend className="font-medium">성별</legend>
            <div className="flex gap-6 pt-2">
              {GENDER_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-1.5">
                  <input type="radio" value={option.value} {...register("gender")} />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.gender && <span className="text-destructive text-xs p-1">{errors.gender.message}</span>}
          </fieldset>

          {isError && (
            <p className="text-destructive text-sm text-center mb-2">
              {error instanceof Error ? error.message : "저장에 실패했어요. 잠시 후 다시 시도해 주세요."}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full self-center mt-4"
            disabled={!isDirty || !isValid || isSubmitting || isPending}>수정 완료</Button>

          <AddressSearchModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            setValue={setValue}
            trigger={trigger}
          />
        </form>
      </div>
    </ListState>
  )
}
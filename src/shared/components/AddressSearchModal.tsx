import { useEffect, useRef } from "react"
import type { UseFormSetValue, UseFormTrigger } from 'react-hook-form'
import { X } from "lucide-react"
import type { ProfileValidSchema } from "../constants/inputconfig"

/* daum 우편번호 스크립트는 별도 타입 패키지가 없어 window 객체에 직접 타입을 선언함 */
declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        onComplete: (data: any) => void;
        width?: string | number;
        height?: string | number;
      }) => {
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

interface AddressSearchModalProps {
  isOpen: boolean,
  onClose: () => void,
  setValue: UseFormSetValue<ProfileValidSchema>,
  trigger: UseFormTrigger<ProfileValidSchema>
}

export const AddressSearchModal = ({ isOpen, onClose, setValue, trigger }: AddressSearchModalProps) => {
    const layerRef = useRef<HTMLDivElement>(null)
    const Icon = X

    useEffect(() => {
        if (!isOpen) return
        
        const initLayerPostcode = () => {
            if (!layerRef.current || !window.daum) return
            
            /* modal 창 띄우고 주소를 선택하였을 때 해당 주소를 input에 추가하고 modal 창은 자동으로 닫기 */
            new window.daum.Postcode({
                onComplete: (data: any) => {
                    let fullAddress = data.address
                    let extraAddress = ''
                    
                    if (data.addressType === 'R') {
                        if (data.bname !== '') extraAddress += data.bname
                        if (data.buildingName !== '') {
                            extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName
                        }

                        fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''
                    }
                    
                    setValue('baseAddress', fullAddress)
                    trigger('baseAddress')
                    onClose()
                },
                width: '100%',
                height: '100%',
            }).embed(layerRef.current)
        }
        
        if (!window.daum || !window.daum.Postcode) {
            const script = document.createElement('script')

            /* 카카오/다음의 주소 찾기 사용 => 이유 : 국내에서 가장 많이 사용하여 익숙할 것이라 판단함. */
            script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
            script.async = true

            /* daum.Postcode 스크립트 로드 직후 객체 초기화를 잠깐 기다림 */
            script.onload = () => setTimeout(initLayerPostcode, 100) 

            document.body.appendChild(script)
        } 
        
        else {
            setTimeout(initLayerPostcode, 100)
        }
    }, [isOpen, setValue, trigger, onClose])

  if (!isOpen) return null

  return (
    /* modal 창의 뒷배경 설정 및 modal 창의 위치 설정 */
    <div className="fixed inset-0 bg-muted-foreground/60 flex items-center justify-center z-50 p-4">
      {/* modal의 창의 크기 설정 및 화면에서 띄워진다는 효과 넣기 */}
      <div className="relative flex flex-col w-5/6 max-w-sm h-2/3 rounded-md overflow-hidden shadow-2xl bg-background">
        {/* modal의 상단 설정 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-border">
          <span className="font-medium text-md">주소 검색</span>
          <Icon className="text-muted-foreground cursor-pointer" onClick={onClose}/>
        </div>
        
        {/* 주소 찾기 화면 */}
        <div ref={layerRef} className="flex-1 w-full" />
      </div>
    </div>
  );
}; 

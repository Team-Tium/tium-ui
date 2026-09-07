import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { RequireAuth, RequireOnboarding } from './guards'

// 라우트 단위로 잘라서 내려받는다. 49화면을 한 덩어리로 만들지 않는다.
// docs/architecture.md 5-1
const TabBarLayout = lazy(() => import('@/layouts/TabBarLayout'))

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const OAuthCallbackPage = lazy(() => import('@/features/auth/pages/OAuthCallbackPage'))
const OnboardingPhonePage = lazy(() => import('@/features/auth/pages/OnboardingPhonePage'))
const OnboardingProfilePage = lazy(() => import('@/features/auth/pages/OnboardingProfilePage'))
const OnboardingPermissionPage = lazy(() => import('@/features/auth/pages/OnboardingPermissionPage'))

const ChatListPage = lazy(() => import('@/features/chat/pages/ChatListPage'))
const ChatRoomPage = lazy(() => import('@/features/chat/pages/ChatRoomPage'))

// 통화 화면은 WebRTC 코드가 무거워진다. 반드시 별도 청크로 남긴다. docs/architecture.md 5-1
const VoiceCallReadyPage = lazy(() => import('@/features/call/pages/VoiceCallReadyPage'))
const VoiceCallWaitingPage = lazy(() => import('@/features/call/pages/VoiceCallWaitingPage'))
const VoiceCallPage = lazy(() => import('@/features/call/pages/VoiceCallPage'))
const VideoCallReadyPage = lazy(() => import('@/features/call/pages/VideoCallReadyPage'))
const VideoCallWaitingPage = lazy(() => import('@/features/call/pages/VideoCallWaitingPage'))
const VideoCallPage = lazy(() => import('@/features/call/pages/VideoCallPage'))
const CallEndPage = lazy(() => import('@/features/call/pages/CallEndPage'))

const RandomEntryPage = lazy(() => import('@/features/random/pages/RandomEntryPage'))
const RandomChatPage = lazy(() => import('@/features/random/pages/RandomChatPage'))
const RandomVoiceReadyPage = lazy(() => import('@/features/random/pages/RandomVoiceReadyPage'))
const RandomVoiceCallPage = lazy(() => import('@/features/random/pages/RandomVoiceCallPage'))
const RandomVideoReadyPage = lazy(() => import('@/features/random/pages/RandomVideoReadyPage'))
const RandomVideoCallPage = lazy(() => import('@/features/random/pages/RandomVideoCallPage'))
const RandomVideoWaitingPage = lazy(() => import('@/features/random/pages/RandomVideoWaitingPage'))
const RandomCallEndPage = lazy(() => import('@/features/random/pages/RandomCallEndPage'))

const FeedListPage = lazy(() => import('@/features/feed/pages/FeedListPage'))
const MyPostsPage = lazy(() => import('@/features/feed/pages/MyPostsPage'))
const FeedWritePage = lazy(() => import('@/features/feed/pages/FeedWritePage'))
const FriendListPage = lazy(() => import('@/features/feed/pages/FriendListPage'))

const FeedbackListPage = lazy(() => import('@/features/feedback/pages/FeedbackListPage'))
const FeedbackDetailPage = lazy(() => import('@/features/feedback/pages/FeedbackDetailPage'))

const MyPage = lazy(() => import('@/features/my/pages/MyPage'))
const MyVerifyPage = lazy(() => import('@/features/my/pages/MyVerifyPage'))
const ProfileEditPage = lazy(() => import('@/features/my/pages/ProfileEditPage'))
const ReportPage = lazy(() => import('@/features/my/pages/ReportPage'))
const SettingsPage = lazy(() => import('@/features/my/pages/SettingsPage'))
const FaqPage = lazy(() => import('@/features/my/pages/FaqPage'))
const SuggestPage = lazy(() => import('@/features/my/pages/SuggestPage'))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* 로그인 전에 볼 수 있는 화면 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback/:provider" element={<OAuthCallbackPage />} />

          <Route element={<RequireAuth />}>
            {/* 온보딩 — 완료 여부를 검사하지 않는다. 여기가 완료하러 오는 곳이다 */}
            <Route path="/onboarding/phone" element={<OnboardingPhonePage />} />
            <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
            <Route path="/onboarding/permission" element={<OnboardingPermissionPage />} />

            <Route element={<RequireOnboarding />}>
              {/* 탭바가 있는 화면 */}
              <Route element={<TabBarLayout />}>
                <Route path="/" element={<ChatListPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />

                <Route path="/people" element={<FeedListPage />} />
                <Route path="/people/my-posts" element={<MyPostsPage />} />
                <Route path="/people/new" element={<FeedWritePage />} />
                <Route path="/people/friends" element={<FriendListPage />} />

                <Route path="/feedback" element={<FeedbackListPage />} />
                <Route path="/feedback/:id" element={<FeedbackDetailPage />} />

                <Route path="/my" element={<MyPage />} />
                <Route path="/my/verify" element={<MyVerifyPage />} />
                <Route path="/my/profile/edit" element={<ProfileEditPage />} />
                <Route path="/my/settings" element={<SettingsPage />} />
                <Route path="/my/settings/faq" element={<FaqPage />} />
                <Route path="/my/settings/suggest" element={<SuggestPage />} />
                <Route path="/report/:targetId" element={<ReportPage />} />
              </Route>

              {/* 탭바가 없는 화면 — 통화 */}
              <Route path="/call/voice/:roomId/ready" element={<VoiceCallReadyPage />} />
              <Route path="/call/voice/:roomId/waiting" element={<VoiceCallWaitingPage />} />
              <Route path="/call/voice/:roomId" element={<VoiceCallPage />} />
              <Route path="/call/video/:roomId/ready" element={<VideoCallReadyPage />} />
              <Route path="/call/video/:roomId/waiting" element={<VideoCallWaitingPage />} />
              <Route path="/call/video/:roomId" element={<VideoCallPage />} />
              <Route path="/call/:callId/end" element={<CallEndPage />} />

              {/* 탭바가 없는 화면 — 랜덤 대화 */}
              <Route path="/random" element={<RandomEntryPage />} />
              <Route path="/random/chat/:roomId" element={<RandomChatPage />} />
              <Route path="/random/call/voice/ready" element={<RandomVoiceReadyPage />} />
              <Route path="/random/call/voice/:sessionId" element={<RandomVoiceCallPage />} />
              <Route path="/random/call/video/ready" element={<RandomVideoReadyPage />} />
              <Route path="/random/call/video/:sessionId" element={<RandomVideoCallPage />} />
              <Route path="/random/video/waiting" element={<RandomVideoWaitingPage />} />
              <Route path="/random/call/:sessionId/end" element={<RandomCallEndPage />} />
            </Route>
          </Route>

          {/* docs/ia.md 에 404 화면이 없다. 없는 주소는 홈으로 보낸다 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

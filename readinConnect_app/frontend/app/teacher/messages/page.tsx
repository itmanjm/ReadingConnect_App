'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, MessageCircle, Users, Search, Plus, FileText, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTeacherStudents } from '@/lib/hooks/useTeachers'
import { useMessages, Message } from '@/lib/hooks/useMessages'
import { useAuthStore } from '@/lib/stores/auth'

interface Student {
  id: string
  email: string
  full_name?: string
  role?: string
  current_reading_level?: string
}

export default function TeacherMessages() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { data: studentsData, isLoading } = useTeacherStudents()
  const students = studentsData?.students || []
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { 
    conversations, 
    messages,
    loading,
    sendMessage, 
    getConversationMessages, 
    markAsRead 
  } = useMessages(
    user?.uid || '', 
    'teacher', 
    user?.displayName || user?.email || 'Teacher'
  )

  useEffect(() => {
    if (selectedStudent) {
      const convId = [user?.uid, selectedStudent.id].sort().join('_')
      const unsubscribe = getConversationMessages(convId)
      
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      
      return () => unsubscribe()
    }
  }, [selectedStudent, getConversationMessages, user?.uid])

  const handleSendMessage = async () => {
    if (!selectedStudent || !messageContent.trim()) return

    await sendMessage(
      selectedStudent.id,
      selectedStudent.full_name || selectedStudent.email,
      messageContent,
      subject || undefined,
      priority
    )

    setMessageContent('')
    setSubject('')
    setPriority('normal')
    setShowNewMessage(false)
  }

  const getOtherParticipant = (conv: any): { id: string; name: string } | null => {
    if (!user?.uid || !conv.participantNames) return null
    const otherId = conv.participantIds.find((id: string) => id !== user.uid)
    if (!otherId) return null
    return {
      id: otherId,
      name: conv.participantNames[otherId] || 'Unknown'
    }
  }

  const getPriorityColor = (p: string): string => {
    switch (p) {
      case 'urgent': return 'text-red-500'
      case 'high': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const filteredStudents = students.filter(s => 
    (s.full_name || s.email).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8B7355]">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFB5BA]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard/teacher')}
            className="flex items-center gap-2 text-[#5A4A42] hover:text-[#FF6B6B] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-[#5A4A42] flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-[#FF6B6B]" />
            Messages
          </h1>
          <button
            onClick={() => router.push('/teacher/reports')}
            className="flex items-center gap-2 bg-[#4ECDC4] text-white px-4 py-2 rounded-full font-bold hover:bg-[#3DBDB5] transition-colors"
          >
            <FileText className="h-4 w-4" />
            Reports
          </button>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="grid grid-cols-3 h-full">
              <div className="border-r border-[#FFB5BA]/20 overflow-y-auto">
                <div className="p-4 border-b border-[#FFB5BA]/10 bg-[#FFF8F0]">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-[#FF6B6B]" />
                    <h3 className="font-bold text-[#5A4A42]">Conversations</h3>
                  </div>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355]" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="divide-y divide-[#FFB5BA]/10">
                  {conversations.map((conv) => {
                    const other = getOtherParticipant(conv)
                    if (!other) return null

                    return (
                      <button
                        key={conv.id}
                        onClick={() => {
                          const student = students.find(s => s.id === other.id)
                          if (student) setSelectedStudent(student)
                        }}
                        className={`w-full p-4 text-left hover:bg-[#FFB5BA]/10 transition-colors ${
                          selectedStudent?.id === other.id ? 'bg-[#FFB5BA]/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-bold">
                            {(other.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#5A4A42] truncate">{other.name}</p>
                            <p className="text-sm text-[#8B7355] truncate">
                              {conv.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {conversations.length === 0 && (
                    <div className="p-8 text-center text-[#8B7355]">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No conversations yet</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-[#FFB5BA]/10">
                  <button
                    onClick={() => setShowNewMessage(true)}
                    className="w-full py-3 bg-[#FF6B6B] text-white rounded-xl font-bold hover:bg-[#FF5252] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    New Message
                  </button>
                </div>
              </div>

              <div className="col-span-2 flex flex-col h-full">
                {selectedStudent ? (
                  <>
                    <div className="p-4 border-b border-[#FFB5BA]/20 bg-[#FFF8F0]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-bold">
                          {(selectedStudent.full_name || selectedStudent.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#5A4A42]">
                            {selectedStudent.full_name || 'Unknown Student'}
                          </h3>
                          <p className="text-sm text-[#8B7355]">{selectedStudent.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId === user?.uid
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                isOwn
                                  ? 'bg-[#FF6B6B] text-white rounded-br-md'
                                  : 'bg-[#B8E0D2] text-[#5A4A42] rounded-bl-md'
                              }`}
                            >
                              {msg.subject && (
                                <p className={`text-xs font-bold mb-1 ${isOwn ? 'text-white/80' : 'text-[#4ECDC4]'}`}>
                                  {msg.subject}
                                </p>
                              )}
                              <p className="text-sm">{msg.content}</p>
                              <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                {msg.priority !== 'normal' && (
                                  <span className={`text-xs ${getPriorityColor(msg.priority)}`}>
                                    {msg.priority === 'urgent' ? '🔴' : '🟠'}
                                  </span>
                                )}
                                <span className={`text-xs ${isOwn ? 'text-white/60' : 'text-[#8B7355]'}`}>
                                  {msg.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-[#FFB5BA]/20 bg-[#FFF8F0]">
                      <div className="flex gap-2 mb-2">
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as 'normal' | 'high' | 'urgent')}
                          className="px-3 py-1 rounded-lg border-2 border-[#FFB5BA]/30 text-sm"
                        >
                          <option value="normal">Normal</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Subject (optional)"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none text-sm"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageContent.trim()}
                          className="px-6 py-2 bg-[#FF6B6B] text-white rounded-xl font-bold hover:bg-[#FF5252] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send className="h-5 w-5" />
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#8B7355]">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Select a conversation</p>
                      <p className="text-sm mt-2">or start a new message</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showNewMessage && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <h3 className="text-xl font-bold text-[#5A4A42] mb-4">New Message</h3>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#8B7355] mb-2">Select Student</label>
                  <select
                    onChange={(e) => {
                      const student = students.find(s => s.id === e.target.value)
                      if (student) {
                        setSelectedStudent(student)
                        setShowNewMessage(false)
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                  >
                    <option value="">Choose a student...</option>
                    {filteredStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name || student.email}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="w-full py-3 text-[#8B7355] hover:text-[#5A4A42] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

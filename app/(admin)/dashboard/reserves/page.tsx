'use client'

import {
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Button,
  Card,
  IconButton,
  Input,
  Preview,
  Table,
  Tag
} from 'components'
import { Modal } from 'containers'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { backdrop, isURL, toast } from 'services'

interface State {
  url: string
  name: string
  iconUrl: string
  coverUrl: string
  title: string
  intro: string
  core: string
  platform: string
  pricing: string
}

export default function Page() {
  const { register, handleSubmit, watch, setValue } = useForm<State>({
    defaultValues: {
      url: '',
      name: '',
      iconUrl: '',
      coverUrl: '',
      title: '',
      intro: '',
      core: '',
      platform: '',
      pricing: ''
    }
  })
  const [tags, setTags] = useState<string[]>([])
  const [reserveList, setReserveList] = useState<Table.Reserve[]>([])
  const [isAddTagOpen, setIsAddTagOpen] = useState<boolean>(false)
  const [tagList, setTagList] = useState<Table.Tag[]>([])
  const [isReserveOpen, setIsReserveOpen] = useState<boolean>(false)
  const [id, setId] = useState<number>(0)

  const supabase = createClientComponentClient<Database>()

  const getList = async () => {
    const { data, error } = await supabase
      .from('reserves')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) {
      console.error(error)
    }
    setReserveList(data || [])
  }

  const getTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
    if (error) toast.error(error.message)
    setTagList(data || [])
  }

  const onSubmit = async (form: State) => {
    backdrop.open()
    const { error } = await supabase.from('reserves').insert({
      url: form.url,
      name: form.name,
      icon_url: form.iconUrl,
      cover_url: form.coverUrl,
      title: form.title,
      intro: form.intro,
      core: form.core,
      platform: form.platform,
      pricing: form.pricing,
      tags
    })
    backdrop.close()
    if (error) {
      toast.error('메시지 예약 에러')
      console.error(error)
      return
    }
    Object.keys(watch()).forEach((key: any) => setValue(key, ''))
    setTags([''])
    getList()
  }

  const removeReserve = async (id: number) => {
    if (!window.confirm('삭제하시겠습니까?')) return
    backdrop.open()
    const { error } = await supabase.from('reserves').delete().eq('id', id)
    backdrop.close()
    if (error) {
      toast.error('실패했습니다.')
      console.error(error)
      return
    }
    getList()
  }

  const sendMessage = async (item: Table.Reserve) => {
    if (!window.confirm('전송하시겠습니까?')) return
    backdrop.open()
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ id: item.id }),
        cache: 'no-cache'
      })
      const { success, message, data } = await res.json()
      console.log('data', data)
      if (success) {
        toast.success('전송되었습니다.')
      } else {
        toast.error(message || '실패했습니다.')
      }
    } catch (err) {
      console.log(err)
    } finally {
      backdrop.close()
    }
  }

  useEffect(() => {
    getList()
    getTags()
    window.onbeforeunload = () => 'asd'
    return () => {
      window.onbeforeunload = null
    }
  }, [])
  return (
    <>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold md:text-4xl">메시지 예약</h2>
        <Card title={`예약 리스트 ${reserveList.length}개`}>
          <Table
            list={reserveList}
            size="sm"
            columns={
              <tr>
                <th>이름</th>
                <th className="min-w-[90px]">아이콘</th>
                <th className="min-w-[180px]">커버</th>
                <th>액션</th>
                <th>태그</th>
                <th>타이틀</th>
                <th>한 줄 소개</th>
                <th>핵심 기능</th>
                <th>지원 플랫폼</th>
                <th>가격 정책</th>
                <th>생성일</th>
              </tr>
            }
            renderItem={(item, key) => (
              <tr key={key}>
                <td>
                  <Link
                    href={item.url}
                    target="_blank"
                    className="text-blue-500 hover:underline"
                  >
                    {item.name}
                  </Link>
                </td>
                <td>
                  <img
                    src={item.icon_url}
                    alt=""
                    className="h-[88px] w-[88px] cursor-pointer rounded-lg"
                    onClick={() => {
                      setIsReserveOpen(true)
                      setId(item.id)
                    }}
                  />
                </td>
                <td>
                  <img src={item.cover_url} alt="" className="rounded" />
                </td>
                <td>
                  <div className="flex items-center justify-center gap-2">
                    <IconButton onClick={() => sendMessage(item)}>
                      <PaperAirplaneIcon />
                    </IconButton>
                    <IconButton onClick={() => removeReserve(item.id)}>
                      <TrashIcon />
                    </IconButton>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-xl bg-neutral-700 px-3 py-1.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{item.title}</td>
                <td>{item.intro}</td>
                <td>{item.core}</td>
                <td>{item.platform}</td>
                <td>{item.pricing}</td>
                <td>
                  {new Intl.DateTimeFormat('ko', {
                    dateStyle: 'medium',
                    timeStyle: 'medium'
                  }).format(new Date(item.created_at))}
                </td>
              </tr>
            )}
          />
        </Card>
        <Card title="템플릿">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Preview.Slack
              title={watch('title')}
              core={watch('core')}
              url={watch('url')}
              platform={watch('platform')}
              pricing={watch('pricing')}
              name={watch('name')}
              intro={watch('intro')}
              iconUrl={watch('iconUrl')}
              coverUrl={watch('coverUrl')}
              tags={tags}
            />
            <Preview.Discord
              title={watch('title')}
              core={watch('core')}
              url={watch('url')}
              platform={watch('platform')}
              pricing={watch('pricing')}
              name={watch('name')}
              intro={watch('intro')}
              iconUrl={watch('iconUrl')}
              coverUrl={watch('coverUrl')}
              tags={tags}
            />
          </div>
        </Card>
        <Card title={`메시지 (리스트 ${reserveList.length}개)`}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-3"
          >
            <Input
              className="col-span-2"
              placeholder="URL"
              required
              type="url"
              register={register('url', { required: true })}
            />
            <Input
              placeholder="이름"
              required
              register={register('name', { required: true })}
            />
            <Input
              className="col-span-3"
              placeholder="Icon URL"
              required
              type="url"
              register={register('iconUrl', { required: true })}
            />
            <Input
              className="col-span-3"
              placeholder="Cover URL"
              required
              type="url"
              register={register('coverUrl', { required: true })}
            />
            <div className="col-span-3 flex flex-wrap items-center gap-4">
              {tags.map((tag, i) => (
                <Tag
                  key={i}
                  onRemove={() => setTags(tags.filter((_, key) => key !== i))}
                  tagList={tagList}
                  value={tag}
                  onChange={(name) =>
                    setTags([...tags.slice(0, i), name, ...tags.slice(i + 1)])
                  }
                />
              ))}
              <IconButton onClick={() => setTags([...tags, ''])}>
                <PlusIcon />
              </IconButton>
              <Button
                onClick={() => setIsAddTagOpen(true)}
                text="태그 관리"
                type="button"
              />
            </div>
            <Input
              className="col-span-3"
              placeholder="타이틀"
              required
              register={register('title', { required: true })}
            />
            <Input
              className="col-span-3"
              placeholder="한 줄 소개"
              required
              register={register('intro', { required: true })}
            />
            <Input
              className="col-span-3"
              placeholder="핵심 기능"
              required
              register={register('core', { required: true })}
            />
            <Input
              className="col-span-3"
              placeholder="지원 플랫폼"
              required
              register={register('platform', { required: true })}
            />
            <Input
              className="col-span-3"
              placeholder="가격 정책"
              required
              register={register('pricing', { required: true })}
            />
            <div className="flex gap-2">
              <Button
                text="예약"
                disabled={
                  !isURL(watch('url')) ||
                  Object.values(watch()).some((value) => !value) ||
                  tags.some((v) => !v)
                }
              />
              <Button
                type="button"
                text="비우기"
                onClick={() => {
                  Object.keys(watch()).forEach((key: any) => setValue(key, ''))
                  setTags([''])
                }}
              />
            </div>
          </form>
        </Card>
      </div>
      {isAddTagOpen && (
        <Modal.AddTag
          isOpen={isAddTagOpen}
          onClose={() => setIsAddTagOpen(false)}
          onComplete={getTags}
        />
      )}
      {isReserveOpen && (
        <Modal.Reserve
          isOpen={isReserveOpen}
          onClose={() => {
            setIsReserveOpen(false)
            setId(0)
          }}
          id={id}
          onComplete={getList}
          tagList={tagList}
        />
      )}
    </>
  )
}

/** @format */

import React, { useState } from 'react'
import ModalWithRouting from '../stats/modals/modal'
import classNames from 'classnames'
import { SavedSegment } from './segments'

export const CreateSegmentModal = ({
  segment,
  close,
  onSave,
  namePlaceholder
}: {
  segment?: SavedSegment
  close: () => void
  onSave: (input: { name: string; personal: boolean }) => void
  namePlaceholder: string
}) => {
  const [name, setName] = useState(
    segment?.name ? `Copy of ${segment.name}` : ''
  )
  const [personal, setPersonal] = useState(true)

  return (
    <ModalWithRouting maxWidth="460px" className="p-6 min-h-fit" close={close}>
      <h1 className="text-xl font-extrabold	dark:text-gray-100">
        Create segment
      </h1>
      <label
        htmlFor="name"
        className="block mt-2 text-md font-medium text-gray-700 dark:text-gray-300"
      >
        Segment name
      </label>
      <input
        autoComplete="off"
        // ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={namePlaceholder}
        id="name"
        className="block mt-2 p-2 w-full dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
      />
      <div className="mt-1 text-sm">
        Add a name to your segment to make it easier to find
      </div>
      <div className="mt-4 flex items-center">
        <button
          className={classNames(
            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring',
            personal ? 'bg-gray-200 dark:bg-gray-700' : 'bg-indigo-600',
            false && 'cursor-not-allowed'
          )}
          onClick={() => setPersonal((current) => !current)}
        >
          <span
            aria-hidden="true"
            className={classNames(
              'inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-800 shadow transform transition ease-in-out duration-200',
              personal ? 'translate-x-0' : 'translate-x-5'
            )}
          />
        </button>
        <span className="ml-2 font-medium leading-5 text-sm text-gray-900 dark:text-gray-100">
          Show this segment for all site users
        </span>
      </div>
      <div className="mt-8 flex gap-x-2 items-center justify-end">
        <button
          className="h-12 text-md font-medium py-2 px-3 rounded border"
          onClick={close}
        >
          Cancel
        </button>
        <button
          className="h-12 text-md font-medium py-2 px-3 rounded border"
          onClick={() => {
            const trimmedName = name.trim()
            const saveableName = trimmedName.length ? trimmedName : namePlaceholder
            onSave({ name: saveableName, personal })
          }}
        >
          Save
        </button>
      </div>
    </ModalWithRouting>
  )
}

export const UpdateSegmentModal = ({
  close,
  onSave,
  segment,
  namePlaceholder
}: {
  close: () => void
  onSave: (input: { id: number; name: string; personal: boolean }) => void
  segment: SavedSegment
  namePlaceholder: string
}) => {
  const [name, setName] = useState(segment.name)
  const [personal, setPersonal] = useState<boolean>(segment.personal)

  return (
    <ModalWithRouting maxWidth="460px" className="p-6 min-h-fit" close={close}>
      <h1 className="text-xl font-extrabold	dark:text-gray-100">
        Update segment
      </h1>
      <label
        htmlFor="name"
        className="block mt-2 text-md font-medium text-gray-700 dark:text-gray-300"
      >
        Segment name
      </label>
      <input
        autoComplete="off"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={namePlaceholder}
        id="name"
        className="block mt-2 p-2 w-full dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
      />
      <div className="mt-1 text-sm">
        Add a name to your segment to make it easier to find
      </div>
      <div className="mt-4 flex items-center">
        <button
          className={classNames(
            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring',
            personal ? 'bg-gray-200 dark:bg-gray-700' : 'bg-indigo-600',
            false && 'cursor-not-allowed'
          )}
          onClick={() => setPersonal((current) => !current)}
        >
          <span
            aria-hidden="true"
            className={classNames(
              'inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-800 shadow transform transition ease-in-out duration-200',
              personal ? 'translate-x-0' : 'translate-x-5'
            )}
          />
        </button>
        <span className="ml-2 font-medium leading-5 text-sm text-gray-900 dark:text-gray-100">
          Show this segment for all site users
        </span>
      </div>
      <div className="mt-8 flex gap-x-2 items-center justify-end">
        <button
          className="h-12 text-md font-medium py-2 px-3 rounded border"
          onClick={close}
        >
          Cancel
        </button>
        <button
          className="h-12 text-md font-medium py-2 px-3 rounded border"
          onClick={() => {
            const trimmedName = name.trim()
            const saveableName = trimmedName.length ? trimmedName : namePlaceholder
            onSave({ id: segment.id, name: saveableName, personal })
          }}
        >
          Save
        </button>
      </div>
    </ModalWithRouting>
  )
}

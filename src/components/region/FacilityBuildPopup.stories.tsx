import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FacilityBuildPopup } from '@/components/region/FacilityBuildPopup'
import type { Facility } from '@/types/facility'

const meta = {
  title: '지역/캠프/FacilityBuildPopup',
  component: FacilityBuildPopup,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FacilityBuildPopup>

export default meta

type Story = StoryObj<typeof meta>

const PopupWrapper = ({
  installedFacilities,
}: {
  installedFacilities: Facility[]
}) => {
  const [open, setOpen] = useState(true)
  const [installed, setInstalled] = useState(installedFacilities)

  const handleSelect = (facility: Facility) => {
    setInstalled((prev) => [...prev, facility])
    setOpen(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        시설 건설 팝업 열기
      </button>
      {open && (
        <FacilityBuildPopup
          regionId="region-1"
          installedFacilities={installed}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export const Default: Story = {
  args: {
    regionId: 'region-1',
    installedFacilities: [],
    onSelect: () => {},
    onClose: () => {},
  },
  render: (args) => (
    <PopupWrapper
      installedFacilities={args.installedFacilities ?? []}
    />
  ),
}

export const WithSomeInstalled: Story = {
  ...Default,
  args: {
    ...Default.args,
    installedFacilities: ['workshop', 'farm'],
  },
  render: (args) => (
    <PopupWrapper installedFacilities={args.installedFacilities ?? []} />
  ),
}

export const AllInstalled: Story = {
  ...Default,
  args: {
    ...Default.args,
    installedFacilities: ['workshop', 'farm', 'storage', 'well', 'kitchen'],
  },
  render: (args) => (
    <PopupWrapper
      installedFacilities={args.installedFacilities ?? []}
    />
  ),
}

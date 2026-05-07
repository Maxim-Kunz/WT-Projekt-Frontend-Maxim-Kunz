import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutList from './WorkoutList.vue'

global.fetch = vi.fn()

describe('WorkoutList.vue', () => {
    let wrapper

    beforeEach(() => {
        fetch.mockReset()
        fetch.mockResolvedValue({
            ok: true,
            json: async () => []
        })
        wrapper = mount(WorkoutList)
    })

    it('sollte Workouts vom Backend laden und rendern', async () => {
        const mockWorkouts = [
            { id: 1, name: 'Dips', sets: 3 },
            { id: 2, name: 'Klimmzüge', sets: 4 }
        ]

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockWorkouts
        })

        const localWrapper = mount(WorkoutList)

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(localWrapper.text()).toContain('Dips')
        expect(localWrapper.text()).toContain('Klimmzüge')
    })

    it('schaltet den Dark Mode beim Klick auf den Button um', async () => {
        const themeBtn = wrapper.find('.theme-btn')

        expect(wrapper.find('.app-wrapper').classes()).not.toContain('dark-mode')
        await themeBtn.trigger('click')
        expect(wrapper.find('.app-wrapper').classes()).toContain('dark-mode')
    })

    it('berechnet die Gesamtsätze in den Meilensteinen korrekt', async () => {
        wrapper.vm.workouts = [
            { id: 1, name: 'Bankdrücken', sets: 3, date: '2026-05-01' },
            { id: 2, name: 'Kniebeugen', sets: 5, date: '2026-05-02' }
        ]

        expect(wrapper.vm.totalSets).toBe(8)
    })

    it('filtert die angezeigten Workouts korrekt nach Übungsname über das Dropdown', async () => {
        wrapper.vm.workouts = [
            { id: 1, name: 'Bankdrücken', sets: 3, date: '2026-05-01' },
            { id: 2, name: 'Kniebeugen', sets: 5, date: '2026-05-02' },
            { id: 3, name: 'Bankdrücken', sets: 4, date: '2026-05-03' }
        ]

        wrapper.vm.selectedFilter = 'Bankdrücken'

        expect(wrapper.vm.filteredWorkouts.length).toBe(2)
        expect(wrapper.vm.filteredWorkouts[0].name).toBe('Bankdrücken')
    })
})
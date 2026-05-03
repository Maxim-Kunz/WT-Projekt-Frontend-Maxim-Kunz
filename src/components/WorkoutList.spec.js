import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutList from './WorkoutList.vue'

global.fetch = vi.fn()

describe('WorkoutList.vue', () => {
    it('sollte Workouts vom Backend laden und rendern', async () => {
        const mockWorkouts = [
            { id: 1, name: 'Dips', sets: 3 },
            { id: 2, name: 'Klimmzüge', sets: 4 }
        ]


        fetch.mockResolvedValueOnce({
            json: async () => mockWorkouts
        })


        const wrapper = mount(WorkoutList)


        await new Promise(resolve => setTimeout(resolve, 0))


        expect(wrapper.text()).toContain('Dips')
        expect(wrapper.text()).toContain('Klimmzüge')
    })
})
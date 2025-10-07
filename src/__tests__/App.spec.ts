import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts and renders properly', () => {
    const wrapper = mount(App, {
      props: {
        html: '<div>Test content</div>',
        isShadow: false,
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('div').exists()).toBe(true)
  })
})

defmodule PlausibleWeb.Components.Generic do
  @moduledoc """
  Generic reusable components
  """
  use Phoenix.Component, global_prefixes: ~w(phx-)

  attr :title, :string, default: "Notice"
  attr :class, :string, default: ""
  slot :inner_block

  def notice(assigns) do
    ~H"""
    <div class={[
      "rounded-md bg-yellow-50 dark:bg-yellow-100 p-4",
      @class
    ]}>
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-900"><%= @title %></h3>
          <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-800">
            <p>
              <%= render_slot(@inner_block) %>
            </p>
          </div>
        </div>
      </div>
    </div>
    """
  end

  attr :href, :string, required: true
  attr :new_tab, :boolean
  attr :class, :string, default: ""
  slot :inner_block

  def styled_link(assigns) do
    if assigns[:new_tab] do
      assigns = assign(assigns, :icon_class, icon_class(assigns))

      ~H"""
      <.link
        class={[
          "inline-flex items-center gap-x-0.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-600",
          @class
        ]}
        href={@href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <%= render_slot(@inner_block) %>
        <Heroicons.arrow_top_right_on_square class={@icon_class} />
      </.link>
      """
    else
      ~H"""
      <.link
        class={[
          "text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-600",
          @class
        ]}
        href={@href}
      >
        <%= render_slot(@inner_block) %>
      </.link>
      """
    end
  end

  defp icon_class(link_assigns) do
    if String.contains?(link_assigns[:class], "text-sm") do
      ["w-3 h-3"]
    else
      ["w-4 h-4"]
    end
  end

  alias Phoenix.LiveView.JS

  attr :id, :string, required: true

  slot :trigger
  slot :title
  slot :panel

  def modal(assigns) do
    ~H"""
    <div phx-click={show_modal(@id)}>
      <%= render_slot(@trigger) %>
    </div>

    <div id={@id} class="relative z-10 hidden" data-onclose={hide_modal(@id)}>
      <div id={"#{@id}-bg"} class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
          <div
            id={"#{@id}-container"}
            phx-window-keydown={hide_modal(@id)}
            phx-key="escape"
            phx-click-away={hide_modal(@id)}
            class="relative transform overflow-hidden rounded-lg bg-white p-4 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6"
          >
            <div>
              <div class="hidden sm:flex justify-between">
                <h3 class="text-lg font-semibold leading-6 text-gray-900">
                  <%= render_slot(@title) %>
                </h3>

                <button
                  phx-click={hide_modal(@id)}
                  type="button"
                  class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Heroicons.x_mark class="h-6 w-6" />
                </button>
              </div>
              <div class="mt-3 sm:mt-5">
                <%= render_slot(@panel) %>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    """
  end

  def show(js \\ %JS{}, selector) do
    JS.show(js,
      to: selector,
      transition:
        {"transition-all transform ease-out duration-300",
         "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
         "opacity-100 translate-y-0 sm:scale-100"}
    )
  end

  def hide(js \\ %JS{}, selector) do
    JS.hide(js,
      to: selector,
      time: 200,
      transition:
        {"transition-all transform ease-in duration-200",
         "opacity-100 translate-y-0 sm:scale-100",
         "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"}
    )
  end

  def show_modal(js \\ %JS{}, id) when is_binary(id) do
    js
    |> JS.show(to: "##{id}")
    |> JS.show(
      to: "##{id}-bg",
      transition: {"transition-all transform ease-out duration-300", "opacity-0", "opacity-100"}
    )
    |> show("##{id}-container")
    |> JS.add_class("overflow-hidden", to: "body")
    |> JS.focus_first(to: "##{id}-content")
  end

  def hide_modal(js \\ %JS{}, id) do
    js
    |> JS.hide(
      to: "##{id}-bg",
      transition: {"transition-all transform ease-in duration-200", "opacity-100", "opacity-0"}
    )
    |> hide("##{id}-container")
    |> JS.hide(to: "##{id}", transition: {"block", "block", "hidden"})
    |> JS.remove_class("overflow-hidden", to: "body")
    |> JS.pop_focus()
    |> JS.push("modal-closed")
  end

  attr :class, :string, default: ""
  attr :type, :string, default: "button"
  attr :rest, :global
  slot :inner_block

  def button(assigns) do
    ~H"""
    <button
      type={@type}
      class={[
        "rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  def modal_fade_out_duration() do
    200
  end
end

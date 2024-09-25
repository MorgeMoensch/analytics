defmodule PlausibleWeb.Live.GoalSettings.List do
  @moduledoc """
  Phoenix LiveComponent module that renders a list of goals
  """
  use Phoenix.LiveComponent, global_prefixes: ~w(x-)
  use Phoenix.HTML

  alias PlausibleWeb.Live.Components.Modal
  import PlausibleWeb.Components.Generic

  attr(:goals, :list, required: true)
  attr(:domain, :string, required: true)
  attr(:filter_text, :string)
  attr(:site, Plausible.Site, required: true)

  def render(assigns) do
    revenue_goals_enabled? = Plausible.Billing.Feature.RevenueGoals.enabled?(assigns.site)
    assigns = assign(assigns, revenue_goals_enabled?: revenue_goals_enabled?)

    ~H"""
    <div>
      <.filter_bar filter_text={@filter_text} placeholder="Search Goals">
        <.button
          id="add-goal-button"
          phx-click="add-goal"
          mt?={false}
          x-data
          x-on:click={Modal.JS.preopen("goals-form-modal")}
        >
          Add Goal
        </.button>
      </.filter_bar>

      <%= if Enum.count(@goals) > 0 do %>
        <.table rows={@goals}>
          <:tbody :let={goal}>
            <.td truncate>
              <div class="flex">
                <div class="truncate block">
                  <%= if not @revenue_goals_enabled? && goal.currency do %>
                    <div class="font-medium truncate">
                      <%= goal %>
                      <br />
                      <span class="text-red-600">
                        Unlock Revenue Goals by upgrading to a business plan
                      </span>
                    </div>
                  <% else %>
                    <div class="font-medium truncate">
                      <span><%= goal %></span>
                    </div>
                  <% end %>
                </div>
              </div>
            </.td>
            <.td hide_on_mobile truncate max_width="max-w-40">
              <span :if={goal.page_path}>
                <div class="text-gray-500 text-xs">Pageview</div>
                <%= goal.page_path %>
              </span>
              <span :if={goal.event_name}>
                <div class="text-gray-500 text-xs">
                  Custom Event <span :if={goal.currency}>(<%= goal.currency %>)</span>
                </div>
                <%= goal.event_name %>
              </span>
            </.td>
            <.td actions>
              <.edit_button
                :if={!goal.currency || (goal.currency && @revenue_goals_enabled?)}
                x-data
                x-on:click={Modal.JS.preopen("goals-form-modal")}
                phx-click="edit-goal"
                phx-value-goal-id={goal.id}
                id={"edit-goal-#{goal.id}"}
              />
              <.edit_button
                :if={goal.currency && !@revenue_goals_enabled?}
                id={"edit-goal-#{goal.id}-disabled"}
                disabled
                class="cursor-not-allowed"
              />
              <.delete_button
                id={"delete-goal-#{goal.id}"}
                phx-click="delete-goal"
                phx-value-goal-id={goal.id}
                phx-value-goal-name={goal.event_name}
                data-confirm={delete_confirmation_text(goal)}
              />
            </.td>
          </:tbody>
        </.table>
      <% else %>
        <p class="mt-12 mb-8 text-center">
          <span :if={String.trim(@filter_text) != ""}>
            No goals found for this site. Please refine or
            <.styled_link phx-click="reset-filter-text" id="reset-filter-hint">
              reset your search.
            </.styled_link>
          </span>
          <span :if={String.trim(@filter_text) == "" && Enum.empty?(@goals)}>
            No goals configured for this site.
          </span>
        </p>
      <% end %>
    </div>
    """
  end

  def pageview_description(goal) do
    path = goal.page_path

    case goal.display_name do
      "Visit " <> ^path -> ""
      _ -> "#{path}"
    end
  end

  def custom_event_description(goal) do
    if goal.display_name == goal.event_name, do: "", else: "(#{goal.event_name})"
  end

  def goal_description(assigns) do
    ~H"""
    <span :if={@goal.page_path} class="truncate text-gray-400 dark:text-gray-600">
      <%= pageview_description(@goal) %>
    </span>

    <span :if={@goal.event_name} class="truncate text-gray-400 dark:text-gray-600">
      <%= custom_event_description(@goal) %>
    </span>
    """
  end

  defp delete_confirmation_text(goal) do
    if Enum.empty?(goal.funnels) do
      """
      Are you sure you want to remove the following goal:

      #{goal}

      This will just affect the UI, all of your analytics data will stay intact.
      """
    else
      """
      The goal:

      #{goal}

      is part of some funnel(s). If you are going to delete it, the associated funnels will be either reduced or deleted completely. Are you sure you want to remove the goal?
      """
    end
  end
end

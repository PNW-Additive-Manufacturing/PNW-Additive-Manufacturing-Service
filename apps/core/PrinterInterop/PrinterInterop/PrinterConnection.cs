using System.Timers;


namespace PrinterInterop;

/// <summary>
/// 
/// </summary>
public class PrinterConnection 
{
    public ICommunicationStrategy CommunicationStrategy { get; set; }
    public int MaxReconnectAttempts { get; set; } = 10;

    public Func<Task>? OnDisconnect { get; set; }
    /// <summary>
    /// Invoked after a reconnection attempt is made.
    /// </summary>
    public Func<int, Task>? OnReconnectAttempt { get; set; }
    public Func<Task>? OnConnect { get; set; }

    public bool IsConnected => this.CurrentReconnectAttempt == 0;

    protected int CurrentReconnectAttempt { get; set; } = 0;
    protected System.Timers.Timer HealthTimer { get; }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="communicationStrategy">The communication strategy to use.</param>
    /// <param name="healthCheckInterval">The integral at which connection health should be checked.</param>
    public PrinterConnection(ICommunicationStrategy communicationStrategy, TimeSpan healthCheckInterval)
    {
        this.CommunicationStrategy = communicationStrategy;

        this.HealthTimer = new System.Timers.Timer(healthCheckInterval.TotalMilliseconds);
        this.HealthTimer.Elapsed += async (_, _) => await this.UpdateHealth();
        this.HealthTimer.AutoReset = true;
        this.HealthTimer.Enabled = true;
    }

    public async Task UpdateHealth()
    {
        bool isHealthy = await this.IsHealthy();

        if (isHealthy)
        {
            this.HealthTimer.Enabled = true;
            if (this.CurrentReconnectAttempt > 0)
            {
                // We have reconnected!
                this.CurrentReconnectAttempt = 0;
            }
            if (this.OnConnect != null) await this.OnConnect();
            return;
        }

        // Increment the reconnection attempt counter by one.
        this.CurrentReconnectAttempt ++;

        if (this.CurrentReconnectAttempt > this.MaxReconnectAttempts)
        {
            if (this.OnDisconnect != null) await this.OnDisconnect();
            this.HealthTimer.Enabled = false;
            return;
        }

        if (this.OnReconnectAttempt != null) await this.OnReconnectAttempt(this.CurrentReconnectAttempt);
    }

    protected virtual async Task<bool> IsHealthy()
    {
        try 
        {
            return await this.CommunicationStrategy.IsConnected();
        }
        catch (Exception) 
        {
            return false;
        }
    }
}
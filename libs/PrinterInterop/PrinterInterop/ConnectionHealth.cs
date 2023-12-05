using System.Timers;


namespace PrinterInterop;

public enum ConnectionState
{
    Connected,
    Reconnecting,
    Disconnected
}

public class ConnectionHealth
{
    public ICommunicationStrategy CommunicationStrategy { get; set; }
    public int MaxReconnectAttempts { get; set; } = 10;

    public Func<Task>? OnDisconnect { get; set; }
    /// <summary>
    /// Invoked after a reconnection attempt is made.
    /// </summary>
    public Func<int, Task>? OnReconnectAttempt { get; set; }
    public Func<Task>? OnConnect { get; set; }

    public ConnectionState Status { get; private set; }

    protected int CurrentReconnectAttempt { get; set; } = 0;
    protected System.Timers.Timer HealthTimer { get; }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="communicationStrategy">The communication strategy to use.</param>
    /// <param name="healthCheckInterval">The integral at which connection health should be checked.</param>
    public ConnectionHealth(ICommunicationStrategy communicationStrategy, TimeSpan healthCheckInterval)
    {
        this.CommunicationStrategy = communicationStrategy;

        this.HealthTimer = new System.Timers.Timer(healthCheckInterval.TotalMilliseconds);
        this.HealthTimer.Elapsed += async (_, _) => await UpdateHealth();
        this.HealthTimer.AutoReset = true;
    }

    public void Start()
    {
        _ = UpdateHealth();
        this.HealthTimer.Enabled = true;
    }
    public void Stop() => this.HealthTimer.Enabled = false;

    public async Task UpdateHealth()
    {
        var previousState = this.Status;
        bool isHealthy = await this.CommunicationStrategy.HasConnection();

        if (isHealthy)
        {
            this.Status = ConnectionState.Connected;
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
        this.Status = ConnectionState.Reconnecting;

        if (this.CurrentReconnectAttempt > this.MaxReconnectAttempts)
        {
            if (this.OnDisconnect != null) await this.OnDisconnect();
            this.Status = ConnectionState.Disconnected;
            this.HealthTimer.Enabled = false;
            return;
        }

        if (this.OnReconnectAttempt != null) await this.OnReconnectAttempt(this.CurrentReconnectAttempt);
    }
}
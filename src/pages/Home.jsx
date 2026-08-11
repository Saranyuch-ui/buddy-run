Server instance: BCG
Category: SqlConnection
ClientSessionId: 00000000-0000-0000-0000-000000000000
ClientActivityId: 00000000-0000-0000-0000-000000000000
ServerSessionUniqueId: e88293c9-5e3b-4783-965c-18ce17d2e586
ServerActivityId: 00000000-0000-0000-0000-000000000000
EventTime: 08/11/2026 09:16:43
Message (SqlException): RootException: SqlException (HResult: 0x80131904)
Cannot open database "BCG-DB" requested by the login. The login failed.
Login failed for user 'NT AUTHORITY\NETWORK SERVICE'.
ExceptionStackTrace:
   at Microsoft.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, SqlCommand command, Boolean callerHasConnectionLock, Boolean asyncClose)
   at Microsoft.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)
   at Microsoft.Data.SqlClient.TdsParser.Run(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj)
   at Microsoft.Data.SqlClient.SqlInternalConnectionTds.CompleteLogin(Boolean enlistOK)
   at Microsoft.Data.SqlClient.SqlInternalConnectionTds.LoginNoFailover(ServerInfo serverInfo, String newPassword, SecureString newSecurePassword, Boolean redirectedUserInstance, SqlConnectionString connectionOptions, SqlCredential credential, TimeoutTimer timeout)
   at Microsoft.Data.SqlClient.SqlInternalConnectionTds.OpenLoginEnlist(TimeoutTimer timeout, SqlConnectionString connectionOptions, SqlCredential credential, String newPassword, SecureString newSecurePassword, Boolean redirectedUserInstance)
   at Microsoft.Data.SqlClient.SqlInternalConnectionTds..ctor(DbConnectionPoolIdentity identity, SqlConnectionString connectionOptions, SqlCredential credential, Object providerInfo, String newPassword, SecureString newSecurePassword, Boolean redirectedUserInstance, SqlConnectionString userConnectionOptions, SessionData reconnectSessionData, Boolean applyTransientFaultHandling, String accessToken, DbConnectionPool pool, Func`3 accessTokenCallback)
   at Microsoft.Data.SqlClient.SqlConnectionFactory.CreateConnection(DbConnectionOptions options, DbConnectionPoolKey poolKey, Object poolGroupProviderInfo, DbConnectionPool pool, DbConnection owningConnection, DbConnectionOptions userOptions)
   at Microsoft.Data.ProviderBase.DbConnectionFactory.<>c__DisplayClass48_0.<CreateReplaceConnectionContinuation>b__0(Task`1 _)
   at System.Threading.Tasks.ContinuationResultTaskFromResultTask`2.InnerInvoke()
   at System.Threading.ExecutionContext.RunInternal(ExecutionContext executionContext, ContextCallback callback, Object state)
--- End of stack trace from previous location ---
   at System.Threading.ExecutionContext.RunInternal(ExecutionContext executionContext, ContextCallback callback, Object state)
   at System.Threading.Tasks.Task.ExecuteWithThreadLocal(Task& currentTaskSlot, Thread threadPoolThread)
--- End of stack trace from previous location ---
   at Microsoft.Dynamics.Nav.Types.NavCancellationToken.RunActionWithCancellationTokenTaskAsync(Func`2 func)
   at Microsoft.Dynamics.Nav.Runtime.NavSqlConnection.TryConnectAsync()
CallerStackTrace:
   at _Diag_.Net._Async_Internals_()
   at Microsoft.Dynamics.Nav.Types.NavCancellationToken.RunActionWithCancellationTokenTaskAsync(Func`2 func)
   at _Diag_.Net._Async_Internals_()
   at Microsoft.Data.SqlClient.SqlConnection.OpenAsyncRetry.Retry(Task`1 retryTask)
   at _Diag_.Net._Async_Internals_()


ProcessId: 74472
Tag: 000018R
ThreadId: 323
ExecutionId: 1000
CounterInformation: 
CustomParameters: {
}
GatewayCorrelationId: 

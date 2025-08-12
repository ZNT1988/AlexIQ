
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_METRIC = 'metric';
/**
 * Composant statut Alex Ultimate
 * Affiche métriques et état de santé
 */

const AlexStatus = ({ status }) => {
  const { consciousness, autonomy, modules, responseTime, online } = status;

  return (
    <div className="alex-status">
      <div className="status-header">
        <h3>Alex Ultimate v7.0.0</h3>
        <div className={`status-dot ${online ? 'online' : 'offline'}`}>
          {online ? '🟢' : '🔴'}
        </div>
      </div>

      <div className="status-metrics">
        <div className=STR_METRIC>
          <span className=STR_METRIC_LABEL>Conscience:</span>
          <span className=STR_METRIC_VALUE>{consciousness}%</span>
        </div>

        <div className=STR_METRIC>
          <span className=STR_METRIC_LABEL>Autonomie:</span>
          <span className=STR_METRIC_VALUE>{autonomy}%</span>
        </div>

        <div className=STR_METRIC>
          <span className=STR_METRIC_LABEL>Modules:</span>
          <span className=STR_METRIC_VALUE>{modules}</span>
        </div>

        <div className=STR_METRIC>
          <span className=STR_METRIC_LABEL>Temps:</span>
          <span className=STR_METRIC_VALUE>{responseTime}ms</span>
        </div>
      </div>
    </div>
  );
};

export default AlexStatus;
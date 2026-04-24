import api from './axios';

// ── Auth ─────────────────────────────────────────────
export const loginUser = async (name, password) => {
    const response = await api.post('/auth/login', { name, password });
    return response; // returns full response to get headers
};

export const fetchBrigadeLastLogin = async (brigadeId) => {
    const { data } = await api.get(`/auth/brigade-last-login/${brigadeId}`);
    return data; // { lastLogin, userName }
};

// ── Detachments ──────────────────────────────────────
export const fetchDetachments = async () => {
    const { data } = await api.get('/detachments');
    return data;
};

// ── Test Items ───────────────────────────────────────
export const fetchTestItemsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/test-items/brigade/${brigadeId}`);
    return data;
};

export const createTestItem = async (payload) => {
    const { data } = await api.post('/test-items', payload);
    return data;
};

export const updateTestItem = async (id, payload) => {
    const { data } = await api.put(`/test-items/${id}`, payload);
    return data;
};

export const bulkUpdateTestItems = async (payload) => {
    const { data } = await api.put('/test-items/bulk-update', payload);
    return data;
};

export const fetchUpcomingTestItems = async () => {
    const { data } = await api.get('/test-items/upcoming');
    return data;
};

export const fetchWastedTestItems = async () => {
    const { data } = await api.get('/test-items/wasted');
    return data;
};

// ── Test Links ───────────────────────────────────────
export const fetchTestLinksByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/test-links/brigade/${brigadeId}`);
    return data;
};

export const updateTestLinks = async (brigadeId, payload) => {
    const { data } = await api.put(`/test-links/brigade/${brigadeId}`, payload);
    return data;
};

// ── Tool Items ───────────────────────────────────────
export const fetchToolItemsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/tool-items/brigade/${brigadeId}`);
    return data;
};

export const createToolItem = async (payload) => {
    const { data } = await api.post('/tool-items', payload);
    return data;
};

export const updateToolItem = async (id, payload) => {
    const { data } = await api.put(`/tool-items/${id}`, payload);
    return data;
};

// ── Electric Stations ────────────────────────────────
export const fetchElectricStationsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/electric-stations/brigade/${brigadeId}`);
    return data;
};

export const createElectricStation = async (payload) => {
    const { data } = await api.post('/electric-stations', payload);
    return data;
};

export const updateElectricStation = async (id, payload) => {
    const { data } = await api.put(`/electric-stations/${id}`, payload);
    return data;
};

export const deleteElectricStation = async (id) => {
    const { data } = await api.delete(`/electric-stations/${id}`);
    return data;
};

// ── Water Pumps ──────────────────────────────────────
export const fetchWaterPumpsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/water-pumps/brigade/${brigadeId}`);
    return data;
};

export const deleteWaterPump = async (id) => {
    const { data } = await api.delete(`/water-pumps/${id}`);
    return data;
};

export const createWaterPump = async (payload) => {
    const { data } = await api.post('/water-pumps', payload);
    return data;
};

export const updateWaterPump = async (id, payload) => {
    const { data } = await api.put(`/water-pumps/${id}`, payload);
    return data;
};

// ── Hydravlic Tools ──────────────────────────────────
export const fetchHydravlicToolsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/hydravlic-tools/brigade/${brigadeId}`);
    return data;
};

export const deleteHydravlicTool = async (id) => {
    const { data } = await api.delete(`/hydravlic-tools/${id}`);
    return data;
};

export const createHydravlicTool = async (payload) => {
    const { data } = await api.post('/hydravlic-tools', payload);
    return data;
};

export const updateHydravlicTool = async (id, payload) => {
    const { data } = await api.put(`/hydravlic-tools/${id}`, payload);
    return data;
};

// ── Swim Tools ───────────────────────────────────────
export const fetchSwimToolsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/swim-tools/brigade/${brigadeId}`);
    return data;
};

export const deleteSwimTool = async (id) => {
    const { data } = await api.delete(`/swim-tools/${id}`);
    return data;
};

export const createSwimTool = async (payload) => {
    const { data } = await api.post('/swim-tools', payload);
    return data;
};

export const updateSwimTool = async (id, payload) => {
    const { data } = await api.put(`/swim-tools/${id}`, payload);
    return data;
};

// ── Foam Agents ──────────────────────────────────────
export const fetchFoamAgentByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/foam-agents/brigade/${brigadeId}`);
    return data;
};

export const createFoamAgent = async (payload) => {
    const { data } = await api.post('/foam-agents', payload);
    return data;
};

export const updateFoamAgent = async (id, payload) => {
    const { data } = await api.put(`/foam-agents/${id}`, payload);
    return data;
};

// ── Powder ───────────────────────────────────────────
export const fetchPowderByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/powder/brigade/${brigadeId}`);
    return data;
};

export const createPowder = async (payload) => {
    const { data } = await api.post('/powder', payload);
    return data;
};

export const updatePowder = async (id, payload) => {
    const { data } = await api.put(`/powder/${id}`, payload);
    return data;
};

// ── Transfer ─────────────────────────────────────────
export const fetchTransferDataByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/transfer/brigade/${brigadeId}`);
    return data;
};

export const fetchTransferBrigades = async () => {
    const { data } = await api.get('/transfer/brigades');
    return data;
};

export const transferItems = async (payload) => {
    const { data } = await api.put('/transfer', payload);
    return data;
};

// ── Extinguisher Document Links ──────────────────────
export const fetchProtocolsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/extenguis-document-links/brigade/${brigadeId}`);
    return data;
};

export const createProtocol = async (payload) => {
    const { data } = await api.post('/extenguis-document-links', payload);
    return data;
};

export const updateProtocol = async (id, payload) => {
    const { data } = await api.put(`/extenguis-document-links/${id}`, payload);
    return data;
};

export const deleteProtocol = async (id) => {
    const { data } = await api.delete(`/extenguis-document-links/${id}`);
    return data;
};

// ── Usage Liquids Log ────────────────────────────────
export const fetchUsedLiquidsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/usage-liquids-log/brigade/${brigadeId}`);
    return data;
};

export const createUsedLiquid = async (payload) => {
    const { data } = await api.post('/usage-liquids-log', payload);
    return data;
};

export const updateUsedLiquid = async (id, payload) => {
    const { data } = await api.put(`/usage-liquids-log/${id}`, payload);
    return data;
};

export const deleteUsedLiquid = async (id) => {
    const { data } = await api.delete(`/usage-liquids-log/${id}`);
    return data;
};

// ── BackPack Extenguishers ───────────────────────────
export const fetchBackPackExtenguishersByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/backpack-extenguishers/brigade/${brigadeId}`);
    return data;
};

export const createBackPackExtenguisher = async (payload) => {
    const { data } = await api.post('/backpack-extenguishers', payload);
    return data;
};

export const updateBackPackExtenguisher = async (id, payload) => {
    const { data } = await api.put(`/backpack-extenguishers/${id}`, payload);
    return data;
};

export const deleteBackPackExtenguisher = async (id) => {
    const { data } = await api.delete(`/backpack-extenguishers/${id}`);
    return data;
};

// ── Special Tools ────────────────────────────────────
export const fetchSpecialToolsByBrigade = async (brigadeId) => {
    const { data } = await api.get(`/special-tools/brigade/${brigadeId}`);
    return data;
};

export const createSpecialTool = async (payload) => {
    const { data } = await api.post('/special-tools', payload);
    return data;
};

export const updateSpecialTool = async (id, payload) => {
    const { data } = await api.put(`/special-tools/${id}`, payload);
    return data;
};

export const deleteSpecialTool = async (id) => {
    const { data } = await api.delete(`/special-tools/${id}`);
    return data;
};

// ── Generic Datas ────────────────────────────────────
export const fetchGenericDatas = async () => {
    const { data } = await api.get('/generic-datas');
    return data;
};

// ── Archives ─────────────────────────────────────────
export const archiveEquipmentItem = async (payload) => {
    const { data } = await api.post('/archives', payload);
    return data;
};

export const fetchArchivedEquipment = async () => {
    const { data } = await api.get('/archives');
    return data;
};

// ── Transfer Logs ────────────────────────────────────
export const fetchTransferLogs = async (params = {}) => {
    const { data } = await api.get('/transfer/logs', { params });
    return data;
};

// ── Vehicle Types ────────────────────────────────────
export const fetchVehicleTypes = async (brigadeId) => {
    const params = brigadeId ? { brigadeId } : {};
    const { data } = await api.get('/vehicle-types', { params });
    return data;
};

export const createVehicleType = async (payload) => {
    const { data } = await api.post('/vehicle-types', payload);
    return data;
};

export const updateVehicleType = async (id, payload) => {
    const { data } = await api.put(`/vehicle-types/${id}`, payload);
    return data;
};

export const deleteVehicleType = async (id) => {
    const { data } = await api.delete(`/vehicle-types/${id}`);
    return data;
};

// ── Equipment Items ──────────────────────────────────
export const fetchEquipmentItems = async (vehicleTypeId, brigadeId) => {
    const params = vehicleTypeId ? { vehicleTypeId } : {};
    if (brigadeId) params.brigadeId = brigadeId;
    const { data } = await api.get('/equipment-items', { params });
    return data;
};

export const createEquipmentItem = async (payload) => {
    const { data } = await api.post('/equipment-items', payload);
    return data;
};

export const updateEquipmentItem = async (id, payload) => {
    const { data } = await api.put(`/equipment-items/${id}`, payload);
    return data;
};

export const deleteEquipmentItem = async (id) => {
    const { data } = await api.delete(`/equipment-items/${id}`);
    return data;
};

// ── Equipment Availability ───────────────────────────
export const fetchEquipmentAvailability = async (params = {}) => {
    const { data } = await api.get('/equipment-availability', { params });
    return data;
};

export const createEquipmentAvailability = async (payload) => {
    const { data } = await api.post('/equipment-availability', payload);
    return data;
};

export const updateEquipmentAvailability = async (id, payload) => {
    const { data } = await api.put(`/equipment-availability/${id}`, payload);
    return data;
};

export const deleteEquipmentAvailability = async (id) => {
    const { data } = await api.delete(`/equipment-availability/${id}`);
    return data;
};

// ── Search Tools ─────────────────────────────────────
export const searchAllTools = async (query) => {
    const { data } = await api.get('/search/tools', { params: { q: query } });
    return data;
};

// ── Fire Events ──────────────────────────────────────
export const fetchFireEvents = async () => {
    const { data } = await api.get('/fire-events');
    return data;
};

export const fetchFireEvent = async (id) => {
    const { data } = await api.get(`/fire-events/${id}`);
    return data;
};

export const createFireEvent = async (payload) => {
    const { data } = await api.post('/fire-events', payload);
    return data;
};

export const updateFireEvent = async (id, payload) => {
    const { data } = await api.put(`/fire-events/${id}`, payload);
    return data;
};

export const closeFireEvent = async (id) => {
    const { data } = await api.put(`/fire-events/${id}/close`);
    return data;
};

export const deleteFireEvent = async (id) => {
    const { data } = await api.delete(`/fire-events/${id}`);
    return data;
};

export const addEventTeam = async (eventId, payload) => {
    const { data } = await api.post(`/fire-events/${eventId}/teams`, payload);
    return data;
};

export const updateEventTeam = async (teamId, payload) => {
    const { data } = await api.put(`/fire-events/teams/${teamId}`, payload);
    return data;
};

export const removeEventTeam = async (teamId) => {
    const { data } = await api.delete(`/fire-events/teams/${teamId}`);
    return data;
};

export const fetchFireEventHistory = async (eventId) => {
    const { data } = await api.get(`/fire-events/${eventId}/history`);
    return data;
};

export const fetchAllFireEventHistory = async () => {
    const { data } = await api.get('/fire-events/history');
    return data;
};

// ── Garrison Tools (grouped, cross-brigade) ──────────
export const fetchGarrisonTools = async () => {
    const { data } = await api.get('/garrison-tools');
    return data;
};

// ── Users by Brigade ─────────────────────────────────
export const fetchUsersByBrigade = async (brigadeId) => {
    const { data } = await api.get('/users', { params: { brigadeId } });
    return data;
};

// ── Surveys ──────────────────────────────────────────
export const fetchSurveys = async () => {
    const { data } = await api.get('/surveys');
    return data;
};

export const fetchSurvey = async (id) => {
    const { data } = await api.get(`/surveys/${id}`);
    return data;
};

export const createSurvey = async (payload) => {
    const { data } = await api.post('/surveys', payload);
    return data;
};

export const updateSurvey = async (id, payload) => {
    const { data } = await api.put(`/surveys/${id}`, payload);
    return data;
};

export const closeSurvey = async (id) => {
    const { data } = await api.put(`/surveys/${id}/close`);
    return data;
};

export const deleteSurvey = async (id) => {
    const { data } = await api.delete(`/surveys/${id}`);
    return data;
};

export const upsertSurveyResponse = async (id, answers) => {
    const { data } = await api.post(`/surveys/${id}/responses`, { answers });
    return data;
};

export const fetchSurveyResponses = async (id) => {
    const { data } = await api.get(`/surveys/${id}/responses`);
    return data;
};

export const fetchSurveyAggregate = async (id) => {
    const { data } = await api.get(`/surveys/${id}/aggregate`);
    return data;
};

export const downloadSurveyCsv = async (id) => {
    let response;
    try {
        response = await api.get(`/surveys/${id}/export.csv`, {
            responseType: 'blob',
        });
    } catch (err) {
        // Backend returned JSON error as a blob — read it back to text so toast shows real reason
        if (err.response?.data instanceof Blob) {
            const text = await err.response.data.text();
            try {
                const j = JSON.parse(text);
                throw new Error(j.error || text);
            } catch {
                throw new Error(text || `HTTP ${err.response.status}`);
            }
        }
        throw err;
    }
    const disposition = response.headers['content-disposition'] || '';
    // Prefer RFC 5987 filename* (UTF-8) when present; fall back to plain filename=
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainMatch = disposition.match(/filename="?([^";]+)"?/);
    const filename = utf8Match
        ? decodeURIComponent(utf8Match[1])
        : plainMatch?.[1] || `survey-${id}.csv`;
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

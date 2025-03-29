import React, { useState } from "react";
import useAPI from "../../hooks/useAPI";
import { toast } from "react-toastify";
import { Sponsor } from "../../types";
import PlaceAutocompleteInput from "../../utils/PlaceAutocompleteInput";
import MatchSponsorModal from "../Modals/MatchSponsorModal";
import "../../Styles/AddFoodTruck.css";

const defaultSponsor: Sponsor = {
  name: "",
  region: "",
  url: "",
  logo: "",
  email: "",
  phone: "",
  address: "",
};

const AddSponsor: React.FC = () => {
  const [sponsor, setSponsor] = useState<Sponsor>({ ...defaultSponsor });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manualRegion, setManualRegion] = useState(false);
  const [manualAddress, setManualAddress] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const submitApi = useAPI();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSponsor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const requiredFields = ["name", "region", "url", "logo", "email", "phone", "address"];
    const missingField = requiredFields.find((field) => !sponsor[field as keyof Sponsor]);

    if (missingField) {
      toast.error(`❌ Please fill in the ${missingField} field.`);
      return;
    }

    const payload = { ...sponsor, id: editingId || undefined };
    const endpoint = editingId ? "updateSponsor" : "addSponsor";
    const result = await submitApi.callApi(endpoint, "POST", payload);

    const status = result.data?.status;

    if ((status === "duplicate" || status === "softMatch") && result.data?.sponsor) {
      setModalData({
        status,
        match: result.data.sponsor,
        newSponsor: sponsor,
      });

      if (status === "duplicate") {
        toast.error(`⚠️ Sponsor already exists in the system.`);
      }

      return;
    }

    if (result.success && status === "new") {
      toast.success(`${sponsor.name} ${editingId ? "updated" : "added"}!`);
      setSponsor({ ...defaultSponsor });
      setEditingId(null);
    } else {
      toast.error(`❌ ${result.error || "Failed to save sponsor."}`);
    }
  };

  const handleModalAction = async (action: "update" | "createNew" | "cancel") => {
    if (action === "cancel") {
      setModalData(null);
      return;
    }

    const isUpdate = action === "update";
    const endpoint = isUpdate ? "updateSponsor" : "addSponsor";

    const payload = {
      ...sponsor,
      id: isUpdate ? modalData.match.id : undefined,
      ...(action === "createNew" && { forceInsert: true }),
    };

    const result = await submitApi.callApi(endpoint, "POST", payload);

    if (result.success) {
      toast.success(`${sponsor.name} ${isUpdate ? "updated" : "added as new"}!`);
      setSponsor({ ...defaultSponsor });
      setEditingId(null);
    } else {
      toast.error(`❌ ${result.error || "Operation failed."}`);
    }

    setModalData(null);
  };

  return (
    <div className="form-section">
      <h3>📢 Add Sponsor</h3>

      <label htmlFor="name">Sponsor Name:</label>
      <input id="name" name="name" value={sponsor.name} onChange={handleChange} required />

      <div className="input-toggle">
        <label htmlFor="region">Region:</label>
        <button type="button" onClick={() => setManualRegion(!manualRegion)}>
          {manualRegion ? "Use Autocomplete" : "Enter Manually"}
        </button>
      </div>
      {manualRegion ? (
        <input id="region" name="region" value={sponsor.region} onChange={handleChange} />
      ) : (
        <>
          <PlaceAutocompleteInput onSelect={(region) => setSponsor((prev) => ({ ...prev, region }))} />
          {sponsor.region && <div className="region-preview">📍 {sponsor.region}</div>}
        </>
      )}

      <label htmlFor="email">Email Address:</label>
      <input id="email" name="email" type="email" value={sponsor.email} onChange={handleChange} required />

      <label htmlFor="phone">Phone Number:</label>
      <input id="phone" name="phone" type="tel" value={sponsor.phone} onChange={handleChange} required />

      <div className="input-toggle">
        <label htmlFor="address">Address:</label>
        <button type="button" onClick={() => setManualAddress(!manualAddress)}>
          {manualAddress ? "Use Autocomplete" : "Enter Manually"}
        </button>
      </div>
      {manualAddress ? (
        <input id="address" name="address" value={sponsor.address} onChange={handleChange} />
      ) : (
        <>
          <PlaceAutocompleteInput onSelect={(address) => setSponsor((prev) => ({ ...prev, address }))} />
          {sponsor.address && <div className="region-preview">🏠 {sponsor.address}</div>}
        </>
      )}

      <label htmlFor="url">Target URL:</label>
      <input id="url" name="url" value={sponsor.url} onChange={handleChange} required />

      <label htmlFor="logo">Logo URL:</label>
      <input id="logo" name="logo" value={sponsor.logo} onChange={handleChange} required />

      <button onClick={handleSubmit} disabled={submitApi.loading}>
        {editingId ? "Update Sponsor" : "Add Sponsor"}
      </button>

      {modalData && (
        <MatchSponsorModal
          match={modalData.match}
          newSponsor={modalData.newSponsor}
          status={modalData.status}
          onKeepExisting={() => handleModalAction("cancel")}
          onUpdateExisting={() => handleModalAction("update")}
          onAddNew={() => handleModalAction("createNew")}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
};

export default AddSponsor;

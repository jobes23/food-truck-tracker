import React from "react";
import "../../Styles/MatchSponsorModal.css";
import { Sponsor } from "../../types";

interface MatchSponsorModalProps {
  match: Sponsor;
  newSponsor: Sponsor;
  status: "duplicate" | "softMatch";
  onKeepExisting: () => void;
  onUpdateExisting: () => void;
  onAddNew: () => void;
  onClose: () => void;
}

const MatchSponsorModal: React.FC<MatchSponsorModalProps> = ({
  match,
  newSponsor,
  status,
  onKeepExisting,
  onUpdateExisting,
  onAddNew,
  onClose,
}) => {
  return (
    <div className="match-modal-overlay">
      <div className="match-modal">
        <h3>🤔 Possible Sponsor Match Found</h3>
        <p>
          We found a <strong>{status === "duplicate" ? "duplicate" : "similar"}</strong> sponsor
          already in the system. What would you like to do?
        </p>

        <div className="match-comparison">
          <div>
            <h4>📇 Existing Sponsor</h4>
            <ul>
              <li><strong>Name:</strong> {match.name}</li>
              <li><strong>Email:</strong> {match.email}</li>
              <li><strong>Phone:</strong> {match.phone}</li>
              <li><strong>Address:</strong> {match.address}</li>
            </ul>
          </div>

          <div>
            <h4>🆕 New Submission</h4>
            <ul>
              <li><strong>Name:</strong> {newSponsor.name}</li>
              <li><strong>Email:</strong> {newSponsor.email}</li>
              <li><strong>Phone:</strong> {newSponsor.phone}</li>
              <li><strong>Address:</strong> {newSponsor.address}</li>
            </ul>
          </div>
        </div>

        <div className="match-modal-actions">
          <button onClick={onKeepExisting} className="cancel-btn">Keep Existing</button>
          <button onClick={onUpdateExisting} className="update-btn">Update Existing</button>
          <button onClick={onAddNew} className="add-btn">Add As New</button>
        </div>

        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default MatchSponsorModal;

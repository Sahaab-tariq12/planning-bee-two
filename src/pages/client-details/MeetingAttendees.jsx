import React from 'react';
import Input from '../../components/Input';
import { useAppContext } from '../../context/AppContext';

const MeetingAttendees = () => {
  const { clientDetails = {}, updateState } = useAppContext();
  
  const meetingAttendees = clientDetails.meetingAttendees || {};
  const isAnyoneElsePresent = meetingAttendees.isAnyoneElsePresent || false;
  const name = meetingAttendees.name || '';
  const relationship = meetingAttendees.relationship || '';

  const handleInputChange = (field, value) => {
    const updatedMeetingAttendees = {
      ...meetingAttendees,
      [field]: value
    };
    
    const updatedClientDetails = {
      ...clientDetails,
      meetingAttendees: updatedMeetingAttendees
    };
    
    updateState('clientDetails', updatedClientDetails);
  };

  return (
    <div className="bg-[#F3F4F6] rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-4">
      <h4 className="text-[#2D3748] text-[16px] md:text-lg font-semibold">
        Meeting Attendees
      </h4>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anyoneElsePresent"
            checked={isAnyoneElsePresent}
            onChange={(e) => handleInputChange('isAnyoneElsePresent', e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="anyoneElsePresent" className="ml-2 text-gray-700 text-[14px] md:text-[16px]">
            Is anyone else present at the meeting?
          </label>
        </div>

        {isAnyoneElsePresent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Names"
              type="text"
              placeholder="Enter names"
              value={name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <Input
              label="Relationship"
              type="text"
              placeholder="Enter relationship"
              value={relationship}
              onChange={(e) => handleInputChange('relationship', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingAttendees;

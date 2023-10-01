import { Box, Chip, Stack } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useZapNote } from '../hooks/useZapNote';
import { Event } from 'nostr-tools';

const CustomIcon: React.FC = () => {
  return (
    <div style={{marginLeft: '.5rem'}}>
        <i className="fak fa-satoshisymbol-solidtilt"></i>
    </div>
  );
};

type Props = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setZappedAmount: React.Dispatch<React.SetStateAction<number>>;
    eventToZap: Event;
    setZapped: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ZapAmountModal = ({ visible, setVisible, setZappedAmount, setZapped, eventToZap }: Props) => {
    const note = useSelector((state: RootState) => state.note);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const { zapNote } = useZapNote();

    const totalItems = note.zapAmountSettings.length;
    const reversedSettings = [...new Set(note.zapAmountSettings)].reverse();

    const handleChipClick = async (amount: number) => {
        setSelectedAmount(amount);
        setTimeout(() => {
            setSelectedAmount(null);
        }, 1000);  // Remove the selected state after 1 second
        let zapSuccess = await zapNote(eventToZap, amount * 1000);
        if (zapSuccess){
          setZapped(zapSuccess);
          setZappedAmount((prev) => prev + amount);
        }
        setVisible(false);
    };
    
    return (
        <Box 
            sx={{
                display: visible ? 'block' : 'none',
                position: 'absolute', 
                bottom: 5, 
                right: 0, 
            }}>
            <Stack direction="column" spacing={1} alignItems="center">
                {reversedSettings.map((zapAmountSetting, index) => (
                    <Chip
                        key={index + eventToZap.sig}
                        label={zapAmountSetting} 
                        color="primary" 
                        icon={<CustomIcon />} 
                        onClick={() => handleChipClick(zapAmountSetting)}
                        style={{
                            cursor: 'pointer',
                            opacity: (selectedAmount === null || selectedAmount === zapAmountSetting) && visible ? 1 : 0,
                            transform: selectedAmount === zapAmountSetting ? 'scale(1.2)' : 'scale(1)',
                            transition: `opacity 300ms ease ${ (totalItems - index - 1) * 10}ms, transform 300ms ease ${(totalItems - index - 1) * 10}ms`,
                        }}
                    />
                ))}
            </Stack>
        </Box>
    );
};

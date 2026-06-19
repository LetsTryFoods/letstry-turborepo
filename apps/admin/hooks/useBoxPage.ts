import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_ALL_BOX_SIZES,
} from '../lib/boxes/queries';
import {
  CREATE_BOX_SIZE,
  UPDATE_BOX_SIZE,
} from '../lib/boxes/mutations';
import { toast } from 'sonner';

export function useBoxPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<any | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ALL_BOX_SIZES, {
    fetchPolicy: 'network-only',
  });

  const [createBoxMutation] = useMutation(CREATE_BOX_SIZE);
  const [updateBoxMutation] = useMutation(UPDATE_BOX_SIZE);

  const boxes = (data as any)?.getAllBoxSizes || [];

  const filteredBoxes = useMemo(() => {
    return boxes.filter((box: any) =>
      box.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boxes, searchTerm]);

  const handleAddBox = () => {
    setEditingBox(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (box: any) => {
    setEditingBox(box);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBox(null);
  };

  const createBox = async (input: any) => {
    try {
      await createBoxMutation({ variables: { input } });
      toast.success('Box created successfully');
      refetch();
      handleCloseDialog();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create box');
    }
  };

  const updateBox = async (boxId: string, input: any) => {
    try {
      await updateBoxMutation({ variables: { boxId, input } });
      toast.success('Box updated successfully');
      refetch();
      handleCloseDialog();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update box');
    }
  };

  return {
    state: {
      searchTerm,
      isDialogOpen,
      editingBox,
      boxes: filteredBoxes,
      loading,
      error,
    },
    actions: {
      setSearchTerm,
      setIsDialogOpen,
      handleAddBox,
      handleEdit,
      handleCloseDialog,
      createBox,
      updateBox,
    },
  };
}

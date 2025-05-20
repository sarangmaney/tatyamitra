
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PencilIcon, PlusCircle, Loader2 } from 'lucide-react';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AddVendorDialog } from '@/components/dashboard/add-vendor-dialog'; // New component
import { useToast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  ownerName: string;
  vendorName: string;
  phoneNumber?: string;
  district?: string;
  taluka?: string;
  pincode?: string;
  employeeName?: string; // Added
  createdAt?: Timestamp; // Added
  // Add other fields as they are in your Firestore documents
  contactPerson?: string; // Kept from previous, ensure it's in your schema or remove
  email?: string; // Kept from previous
}

const correctPassword = '9595'; // Keep your existing password logic

export default function VendorsPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const { toast } = useToast();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddVendorDialogOpen, setIsAddVendorDialogOpen] = useState(false);

  const fetchVendors = useCallback(async () => {
    if (!isAuthenticated) return; // Don't fetch if not authenticated

    setLoading(true);
    try {
      const vendorsCollectionRef = collection(db, 'vendor');
      // Order by creation date, newest first (optional)
      const q = query(vendorsCollectionRef, orderBy('createdAt', 'desc'));
      const vendorSnapshot = await getDocs(q);
      const vendorsList = vendorSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt, // Ensure Timestamp is correctly handled
      })) as Vendor[];
      setVendors(vendorsList);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Fetch Vendors',
        description: 'Could not load vendor data from the database. Please try again.',
      });
      setVendors([]); // Clear vendors on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  const handlePasswordSubmit = () => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setAuthError('');
      // Fetch vendors immediately after successful authentication
      // No need to call fetchVendors() here, useEffect will handle it.
    } else {
      setAuthError('Incorrect password');
      setIsAuthenticated(false); // Ensure not authenticated on wrong password
      setVendors([]); // Clear vendors on failed auth
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchVendors();
    }
  }, [isAuthenticated, fetchVendors]); // Rerun if isAuthenticated or fetchVendors changes

  const handleEditClick = (vendorId: string) => {
    // Implement your edit logic here, e.g., navigate to an edit page or open an edit dialog
    console.log(`Edit vendor with ID: ${vendorId}`);
    toast({ title: 'Edit Action', description: `Edit functionality for vendor ${vendorId} needs to be implemented.` });
  };

  const handleVendorAdded = () => {
    toast({
      title: 'Vendor Added',
      description: 'The new vendor has been successfully added to the database.',
    });
    fetchVendors(); // Refresh the list after adding
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-sm p-8 bg-card shadow-xl rounded-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-foreground">Access Vendor Management</h1>
          <p className="mb-4 text-muted-foreground text-center">Please enter the password to view vendor information.</p>
          <div className="flex flex-col space-y-3">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="text-center"
            />
            <Button onClick={handlePasswordSubmit} className="w-full bg-accent hover:bg-accent/90">Submit</Button>
          </div>
          {authError && <p className="text-destructive mt-3 text-sm text-center">{authError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground">View, add, and manage registered vendors.</p>
        </div>
        <AddVendorDialog onVendorAdded={handleVendorAdded} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading vendors...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Vendors Found</h2>
          <p className="text-muted-foreground mb-4">Start by adding the first vendor to the system.</p>
          {/* You can directly use the AddVendorDialog's trigger if needed, or keep it separate */}
        </div>
      ) : (
        <div className="overflow-x-auto bg-card p-4 rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.vendorName || '-'}</TableCell>
                  <TableCell>{vendor.ownerName || '-'}</TableCell>
                  <TableCell>{vendor.phoneNumber || '-'}</TableCell>
                  <TableCell>{vendor.district || '-'}</TableCell>
                  <TableCell>{vendor.employeeName || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(vendor.id)} title="Edit Vendor">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '@/lib/firebase'; 

interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
} // Ensure this closing brace is present

const correctPassword = '9595';

export default function VendorsPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      // In a real app, this should be 'vendor' as per your Firestore structure
      // but for the mock data/client-side part, 'vendors' might be what you have if using a different source or mock.
      // Assuming the collection is named 'vendor' based on previous context for Firestore.
      const vendorsCollectionRef = collection(db, 'vendor'); 
      const vendorSnapshot = await getDocs(vendorsCollectionRef);
      const vendorsList = vendorSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().vendorName || doc.data().name || "Unknown Vendor", // Accommodate different name fields
        contactPerson: doc.data().contactPerson,
        email: doc.data().email,
        phoneNumber: doc.data().phoneNumber,
        ...doc.data() // Spread the rest of the data
      })) as Vendor[];
      setVendors(vendorsList);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fallback to empty array or mock data if needed for UI testing
      // setVendors([]); // Example: Fallback to empty
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordSubmit = () => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchVendors();
    }
  }, [isAuthenticated]);

  const handleEditClick = (vendorId: string) => {
    // Implement your edit logic here, e.g., navigate to an edit page
    console.log(`Edit vendor with ID: ${vendorId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vendors</h1>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center">
          <p className="mb-4">Please enter the password to view vendor information.</p>
          <div className="flex space-x-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handlePasswordSubmit}>Submit</Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <>
          {loading ? (
            <p>Loading vendors...</p>
          ) : vendors.length === 0 && !loading ? (
             <p>No vendors found or failed to load vendors.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="w-[50px]"></TableHead> {/* Column for edit button */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.contactPerson || '-'}</TableCell>
                      <TableCell>{vendor.email || '-'}</TableCell>
                      <TableCell>{vendor.phoneNumber || '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(vendor.id)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

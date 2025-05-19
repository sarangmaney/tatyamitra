'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore'; // No change needed for this import
import { db } from '@/lib/firebase'; // Assuming your Firebase instance is exported as 'db'

interface Vendor {
  id: string;
  name: string;
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
      const vendorsCollection = collection(db, 'vendors');
      const vendorSnapshot = await getDocs(vendorsCollection);
      const vendorsList = vendorSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[];
      setVendors(vendorsList);
    } catch (error) {
      console.error('Error fetching vendors:', error);
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
                      <TableCell>{vendor.contactPerson}</TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{vendor.phoneNumber}</TableCell>
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